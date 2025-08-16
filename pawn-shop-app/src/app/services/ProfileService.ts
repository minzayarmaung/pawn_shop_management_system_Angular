import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiBaseUrl}/api`;

  constructor(private http: HttpClient) {}

  // Get user profile
  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/profile`);
  }

  // Update profile (without image)
  updateProfile(profile: Partial<Profile>): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/profile`, profile);
  }

  // Method 1: Direct upload to your backend (which then uploads to S3)
  uploadProfilePictureViaBackend(file: File): Observable<S3UploadResponse> {
    const formData = new FormData();
    formData.append('profilePic', file);
    
    return this.http.post<S3UploadResponse>(`${this.apiUrl}/profile/upload-picture`, formData);
  }

  // Method 2: Get presigned URL and upload directly to S3
  getPresignedUrl(fileName: string, fileType: string): Observable<PresignedUrlResponse> {
    return this.http.post<PresignedUrlResponse>(`${this.apiUrl}/profile/presigned-url`, {
      fileName,
      fileType
    });
  }

  // Upload file directly to S3 using presigned URL
  uploadToS3(presignedUrl: string, file: File): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': file.type
    });

    return this.http.put(presignedUrl, file, { 
      headers,
      reportProgress: true,
      observe: 'events'
    });
  }

  // Method 3: Complete S3 upload workflow (recommended)
  async uploadProfilePicture(file: File): Promise<S3UploadResponse> {
    try {
      // Step 1: Get presigned URL from your backend
      const presignedResponse = await this.getPresignedUrl(file.name, file.type).toPromise();
      
      if (!presignedResponse) {
        throw new Error('Failed to get presigned URL');
      }

      // Step 2: Upload directly to S3
      await this.uploadToS3(presignedResponse.uploadUrl, file).toPromise();
      
      // Step 3: Return S3 URL and key
      return {
        s3Url: presignedResponse.s3Url,
        s3Key: presignedResponse.s3Key
      };
      
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  // Delete profile picture from S3
  deleteProfilePicture(s3Key: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile/picture/${encodeURIComponent(s3Key)}`);
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
}