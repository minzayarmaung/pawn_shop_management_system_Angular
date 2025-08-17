
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../services/pipes/translate.pipe';
import { TranslationService } from '../../../services/TranslationService';
import { ProfileService } from '../../../services/ProfileService';
import { ToastService } from '../../../services/ToastService';
import { firstValueFrom, Observable } from 'rxjs';

export interface UserProfile {
  id?: number;
  profilePic?: string | null;   // S3 URL - can be string, null, or undefined
  profilePicKey?: string | null; // S3 Object Key - can be string, null, or undefined
  name: string;
  nrc: string;
  phone: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  email?: string | null;
  usageTime?: string | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  currentProfilePicUrl: string | null = null;  // Current S3 URL
  isEditing = false;
  isLoading = false;
  isUploadingImage = false;

  // Mock data - you'll replace this with actual backend data
  userInfo = {
    email: 'user@example.com' as string | null,
    usageTime: '2h 30m today' as string | null
  };

  genderOptions = [
    { value: 'male', label: 'profile.gender.male' },
    { value: 'female', label: 'profile.gender.female' }
  ];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private translationService: TranslationService,
    private toastService : ToastService 
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      nrc: ['', [Validators.required, Validators.pattern(/^\d+\/[A-Z]+\([A-Z]\)\d+$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+?95|0)?[1-9]\d{7,9}$/)]],
      dob: ['', [Validators.required]],
      gender: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  // loadProfile(): void {
  //   this.profileService.getProfile().subscribe({
  //     next: (profile) => {
  //       this.profileForm.patchValue(profile);
  //       this.currentProfilePicUrl = profile.profilePic || null;
  //       this.previewUrl = profile.profilePic || null;
  //     },
  //     error: (error) => {
  //       console.error('Error loading profile', error);
  //       // Fallback to mock data
  //       this.loadMockProfile();
  //     }
  //   });
  // }

  private loadMockProfile(): void {
    const mockProfile = {
      name: 'John Doe',
      nrc: '12/MAYA(N)123456',
      phone: '09123456789',
      dob: '1990-01-01',
      gender: 'male',
      profilePic: 'https://your-s3-bucket.s3.amazonaws.com/profile-pics/user-123.jpg'
    };
    
    this.profileForm.patchValue(mockProfile);
    this.currentProfilePicUrl = mockProfile.profilePic || null;
    this.previewUrl = mockProfile.profilePic || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file using service
      const validation = this.profileService.validateImageFile(file);
      if (!validation.valid) {
        // Use your translation service for error messages
        alert(validation.error || 'Invalid file selected');
        return;
      }
      
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = (e.target?.result as string) || null;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEdit(): void {
    if (this.isEditing && this.profileForm.dirty) {
      // You can get the translated text here if needed
      const confirmMessage = 'You have unsaved changes. Do you want to discard them?';
      if (confirm(confirmMessage)) {
        this.profileForm.reset();
        this.loadProfile();
        this.isEditing = false;
      }
    } else {
      this.isEditing = !this.isEditing;
    }
  }

onSubmit(): void {
  if (this.profileForm.valid) {
    this.isLoading = true;
    
    // If there's a new image, upload image first, then save profile
    if (this.selectedFile) {
      this.uploadImageThenSaveProfile();
    } else {
      // Save profile without image change - use existing profilePic value
      this.saveProfileData(this.currentProfilePicUrl);
    }
  } else {
    this.markFormGroupTouched();
    this.toastService.showWarning(
      'Form Invalid',
      'Please check all required fields and try again.'
    );
  }
}

private async uploadImageThenSaveProfile(): Promise<void> {
  try {
    // Show upload start toast
    this.toastService.showInfo(
      'Uploading Image...',
      'Please wait while we upload your image.'
    );
    
    // Step 1: Upload image only and get image URL
    const imageUrl = await this.uploadImageOnly();
    
    // Show image upload success
    this.toastService.showSuccess(
      'Image Uploaded!',
      'Image uploaded successfully. Now saving your profile...'
    );
    
    // Step 2: Save profile data with the image URL
    this.saveProfileData(imageUrl);
    
  } catch (error) {
    console.error('Error in upload process:', error);
    this.handleUploadError(error);
  }
}

private async uploadImageOnly(): Promise<string> {
  if (!this.selectedFile) {
    throw new Error('No file selected');
  }

  this.isUploadingImage = true;
  
  try {
    // Validate file before upload
    const validation = this.profileService.validateImageFile(this.selectedFile);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed');
    }

    console.log('🔍 About to call profileService.uploadImageOnly...');

    // Upload image and get URL/name - using Promise wrapper for better error handling
    const imageUrl = await new Promise<string>((resolve, reject) => {
      this.profileService.uploadImageOnly(this.selectedFile!).subscribe({
        next: (url: string) => {
          console.log('✅ Service returned URL:', url);
          // Clean the URL response (remove quotes if present)
          const cleanUrl = typeof url === 'string' ? url.replace(/"/g, '') : url;
          console.log('🧹 Cleaned URL:', cleanUrl);
          resolve(cleanUrl);
        },
        error: (error) => {
          console.error('❌ Service error:', error);
          // Even if there's an error, check if we got a 200 response
          if (error.status === 200 && error.error && typeof error.error === 'string') {
            console.log('🔧 Got 200 response in error handler:', error.error);
            const cleanUrl = error.error.replace(/"/g, '');
            resolve(cleanUrl);
          } else {
            reject(error);
          }
        }
      });
    });
    
    return imageUrl;
    
  } catch (error) {
    console.error('💥 Error in uploadImageOnly:', error);
    throw error;
  } finally {
    this.isUploadingImage = false;
  }
}

private saveProfileData(profilePicUrl: string | null): void {
  // Prepare profile data to match your ProfileDataRequest structure exactly
  const profileData = {
    profilePic: profilePicUrl, // Just the image URL/name from upload-image
    name: this.profileForm.value.name,
    nrc: this.profileForm.value.nrc,
    phone: this.profileForm.value.phone,
    dob: this.profileForm.value.dob
    // Note: Not sending gender since it's not in your ProfileDataRequest
  };

  console.log('Sending profile data to /upload-profile:', profileData);

  this.profileService.uploadProfileData(profileData).subscribe({
    next: (response) => {
      this.handleSaveSuccess(response, profilePicUrl);
    },
    error: (error) => {
      this.handleSaveError(error);
    }
  });
}

private handleSaveSuccess(response: any, profilePicUrl: string | null): void {
  // Show success toast
  this.toastService.showSuccess(
    'Profile Saved!',
    response.message || 'Your profile has been successfully updated.'
  );
  
  console.log('Profile saved successfully:', response);
  
  // Update component state
  this.currentProfilePicUrl = profilePicUrl;
  this.previewUrl = profilePicUrl; // Update preview to match saved image
  this.selectedFile = null;
  this.isEditing = false;
  this.isLoading = false;
  
  // Optional: Refresh profile data from server
  // this.loadProfile();
}

private handleSaveError(error: any): void {
  let errorMsg = 'Failed to save profile';
  
  // Handle different error types
  if (error.status === 400) {
    errorMsg = 'Invalid profile data. Please check your inputs.';
  } else if (error.status === 401) {
    errorMsg = 'Session expired. Please login again.';
  } else if (error.status === 413) {
    errorMsg = 'File too large. Please select a smaller image.';
  } else if (error.error?.message) {
    errorMsg = error.error.message;
  }
  
  this.toastService.showError(
    'Save Failed!', 
    errorMsg
  );
  console.error('Error saving profile:', error);
  this.isLoading = false;
}

private handleUploadError(error: any): void {
  let errorMsg = 'Failed to upload image';
  
  if (error.message) {
    errorMsg = error.message;
  }
  
  this.toastService.showError(
    'Upload Failed!', 
    errorMsg
  );
  this.isLoading = false;
}

// Optional: Method to retry the entire process
retryProfileUpdate(): void {
  if (this.selectedFile) {
    this.uploadImageThenSaveProfile();
  } else {
    this.saveProfileData(this.currentProfilePicUrl);
  }
}

// Add this import at the top of your component file if you want to use firstValueFrom
// import { firstValueFrom } from 'rxjs';

// OR use the Promise-based approach above (recommended for debugging)

// Update your existing loadProfile method to handle the new structure
loadProfile(): void {
  this.profileService.getProfile().subscribe({
    next: (profile) => {
      // Only update form fields that exist in ProfileDataRequest
      this.profileForm.patchValue({
        name: profile.name,
        nrc: profile.nrc,
        phone: profile.phone,
        dob: profile.dob,
        gender: profile.gender // Keep this for display, but won't be sent to save
      });
      this.currentProfilePicUrl = profile.profilePic || null;
      this.previewUrl = profile.profilePic || null;
      
      // Update userInfo for display
      this.userInfo = {
        email: profile.email || null,
        usageTime: profile.usageTime || null
      };
    },
    error: (error) => {
      console.error('Error loading profile', error);
      this.toastService.showError(
        'Load Failed',
        'Failed to load profile data. Please refresh the page.'
      );
      // Fallback to mock data
      this.loadMockProfile();
    }
  });
}

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      this.profileForm.get(key)?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control?.errors && control?.touched) {
      if (control.errors['required']) {
        return `profile.errors.${fieldName}Required`;
      }
      if (control.errors['minlength']) {
        return `profile.errors.${fieldName}MinLength`;
      }
      if (control.errors['pattern']) {
        return `profile.errors.${fieldName}Pattern`;
      }
    }
    return '';
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedFile = null;
    this.previewUrl = this.currentProfilePicUrl; // Reset to current S3 URL
    this.profileForm.reset();
    this.loadProfile();
  }

  // Helper method to get display URL for profile picture
  getProfilePicUrl(): string {
    return this.previewUrl || this.currentProfilePicUrl || '/assets/images/profile/defaultAvatar.png';
  }

  // Helper method to handle image load errors (for S3 URLs)
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/profile/defaultAvatar.png';
  }
}