
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../services/pipes/translate.pipe';
import { TranslationService } from '../../../services/TranslationService';
import { ProfileService } from '../../../services/ProfileService';

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
    private translationService: TranslationService
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

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
        this.currentProfilePicUrl = profile.profilePic || null;
        this.previewUrl = profile.profilePic || null;
      },
      error: (error) => {
        console.error('Error loading profile', error);
        // Fallback to mock data
        this.loadMockProfile();
      }
    });
  }

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
      
      // If there's a new image, upload to S3 first
      if (this.selectedFile) {
        this.uploadImageToS3().then((s3Url) => {
          this.saveProfile(s3Url);
        }).catch((error) => {
          console.error('Error uploading image to S3', error);
          this.isLoading = false;
        });
      } else {
        // Save profile without image change
        this.saveProfile(this.currentProfilePicUrl);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private async uploadImageToS3(): Promise<string> {
    if (!this.selectedFile) {
      throw new Error('No file selected');
    }

    this.isUploadingImage = true;
    
    try {
      // Optional: Resize image before upload
      // const resizedFile = await this.profileService.resizeImage(this.selectedFile);
      
      const uploadResponse = await this.profileService.uploadProfilePicture(this.selectedFile);
      return uploadResponse.s3Url;
      
    } finally {
      this.isUploadingImage = false;
    }
  }

  private saveProfile(profilePicUrl: string | null): void {
    const profileData = {
      ...this.profileForm.value,
      profilePic: profilePicUrl || undefined // Convert null to undefined for the API
    };

    this.profileService.updateProfile(profileData).subscribe({
      next: (response) => {
        console.log('Profile updated successfully', response);
        this.currentProfilePicUrl = profilePicUrl;
        this.selectedFile = null;
        this.isEditing = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating profile', error);
        this.isLoading = false;
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