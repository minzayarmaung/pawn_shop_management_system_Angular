import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../shared/commons/api.config';
import { Profile } from '../models/Profile.model';

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
  private apiUrl = `${environment.apiBaseUrl}/auth/profile`; // Fixed path to match Spring Boot

  constructor(private http: HttpClient) {}

  // Get user profile
  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${environment.apiBaseUrl}/auth/profile`);
  }

  // Update profile (without image)
  updateProfile(profile: Partial<Profile>): Observable<Profile> {
    return this.http.put<Profile>(`${environment.apiBaseUrl}/auth/profile`, profile);
  }

  // Method 1: Direct upload to your backend (which then uploads to S3)
  uploadProfilePictureViaBackend(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file); // Match @RequestParam name
    
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
    // Don't set Content-Type header for S3 - let browser handle it
    // const headers = new HttpHeaders();

    return this.http.put(presignedUrl, file, { 
      // headers,
      reportProgress: true,
      observe: 'events'
    });
  }

  // In your ProfileService, update this method:
  async uploadProfilePicture(file: File): Promise<string> {
    try {
      // Use the direct backend upload - much simpler!
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
        // Calculate new dimensions
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

        // Resize image
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
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

  uploadImageOnly(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
      
    console.log('🌐 Calling /upload-image endpoint...');
    return this.http.post(`${this.apiUrl}/upload-image`, formData, {
      responseType: 'text' // This is important for string responses!
    });
  }

  uploadProfileData(profileData: any): Observable<any> {
    console.log('🌐 Calling /upload-profile endpoint...');
    return this.http.post<any>(`${this.apiUrl}/upload-profile`, profileData);
  }
}