import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, firstValueFrom, map, throwError } from 'rxjs';
import { environment } from '../shared/commons/api.config';
import { Profile } from '../models/Profile.model';
import { ApiResponse } from '../models/api-response.model';

export interface S3UploadResponse {
  s3Url: string;
  s3Key: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  s3Url: string;
  s3Key: string;
}

export interface PresignedUrlRequest {
  fileName: string;
  fileType: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiBaseUrl}/auth/profile`;

  constructor(private http: HttpClient) {}

  // Get user profile - FIXED VERSION for your backend response structure
  getProfile(userid: number): Observable<Profile> {
    return this.http.get<any>(`${this.apiUrl}/getProfileData`, {
      params: {userid: userid.toString()}
    }).pipe(
      map(response => {
        console.log('📥 Raw API Response:', response);
        
        // Check if the API call was successful based on your backend structure
        if (response.success === 1) {
          // Check if we have data
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            console.log('✅ Profile found:', response.data[0]);
            return response.data[0]; // Return the first profile object
          } else if (response.data && !Array.isArray(response.data)) {
            // Handle case where data is a single object, not array
            console.log('✅ Profile found (single object):', response.data);
            return response.data;
          } else {
            // Success response but no data found
            console.warn('⚠️ API success but no profile data found');
            throw new Error('No profile data found for this user');
          }
        } else if (response.success === 0) {
          // API returned failure with your backend structure
          console.error('❌ API returned failure:', response);
          
          // Handle specific error cases
          if (response.code === 500 && response.message === "Profile Data Not Found") {
            throw new Error('Profile not found. Please create your profile first.');
          } else {
            throw new Error(response.message || 'Failed to fetch profile data');
          }
        } else {
          // Unexpected response structure
          console.error('❌ Unexpected API response structure:', response);
          throw new Error('Unexpected response from server');
        }
      }),
      catchError(error => {
        console.error('💥 Error in getProfile pipe:', error);
        
        // If it's already an Error object, just pass it through
        if (error instanceof Error) {
          return throwError(() => error);
        }
        
        // Handle HTTP errors
        let errorMessage = 'Failed to load profile data';
        
        if (error.status === 404) {
          errorMessage = 'Profile endpoint not found';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized access';
        } else if (error.status === 500) {
          errorMessage = 'Server error occurred';
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (error.error) {
          // If the error response has the same structure as success response
          if (error.error.success === 0) {
            errorMessage = error.error.message || 'Server returned an error';
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Update profile (without image)
  updateProfile(profile: Partial<Profile>): Observable<Profile> {
    return this.http.put<Profile>(`${environment.apiBaseUrl}/auth/profile`, profile);
  }

  // Method 1: Direct upload to your backend (which then uploads to S3)
  uploadProfilePictureViaBackend(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post<string>(`${this.apiUrl}/upload`, formData);
  }

  // Method 2: Get presigned URL and upload directly to S3
  getPresignedUrl(fileName: string, fileType: string): Observable<PresignedUrlResponse> {
    const request: PresignedUrlRequest = {
      fileName,
      fileType
    };
    return this.http.post<PresignedUrlResponse>(`${this.apiUrl}/presigned-url`, request);
  }

  // Upload file directly to S3 using presigned URL
  uploadToS3(presignedUrl: string, file: File): Observable<any> {
    return this.http.put(presignedUrl, file, { 
      reportProgress: true,
      observe: 'events'
    });
  }

  // Upload profile picture using backend
  async uploadProfilePicture(file: File): Promise<string> {
    try {
      const s3Url = await firstValueFrom(this.uploadProfilePictureViaBackend(file));
      return s3Url;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  // Delete profile picture from S3
  deleteProfilePicture(fileName: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/file/${encodeURIComponent(fileName)}`);
  }

  // Get file URL
  getFileUrl(fileName: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/file/${encodeURIComponent(fileName)}`);
  }

  // Helper method to generate S3 key
  generateS3Key(userId: number, fileName: string): string {
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop();
    return `profile-pics/${userId}/${timestamp}.${fileExtension}`;
  }

  // Helper method to validate image file
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please select a JPEG, PNG, GIF, or WebP image.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size too large. Please select an image under 5MB.'
      };
    }

    return { valid: true };
  }

  // Helper method to resize image before upload (optional)
  resizeImage(file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        }, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Upload image only - WITH ERROR HANDLING
  uploadImageOnly(file: File, userid: number, userName: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userid.toString());
    formData.append('userName', userName);
    
    console.log('🌐 Calling /upload-image endpoint...');
    console.log('📤 FormData contents:', {
      file: file.name,
      userId: userid,
      userName: userName
    });
    
    return this.http.post<any>(`${this.apiUrl}/upload-image`, formData).pipe(
      map(response => {
        console.log('📥 Upload image response:', response);
        
        if (response && response.success === 1) {
          return response;
        } else {
          throw new Error(response?.message || 'Image upload failed');
        }
      }),
      catchError(error => {
        console.error('❌ Error uploading image:', error);
        
        let errorMessage = 'Failed to upload image';
        if (error.status === 413) {
          errorMessage = 'File too large';
        } else if (error.status === 400) {
          errorMessage = 'Invalid file or request';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Upload profile data - WITH ERROR HANDLING
  uploadProfileData(profileData: any): Observable<any> {
    console.log('🌐 Calling /upload-profile endpoint...');
    console.log('📤 Profile data:', profileData);
    
    return this.http.post<any>(`${this.apiUrl}/upload-profile`, profileData).pipe(
      map(response => {
        console.log('📥 Upload profile response:', response);
        
        if (response && (response.success === 1 || response.success === true)) {
          return response;
        } else {
          throw new Error(response?.message || 'Profile save failed');
        }
      }),
      catchError(error => {
        console.error('❌ Error saving profile:', error);
        
        let errorMessage = 'Failed to save profile';
        if (error.status === 400) {
          errorMessage = 'Invalid profile data';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Get base image URL
  getBaseImageUrl(): string {
    return `${this.apiUrl}/images`;
  }
}