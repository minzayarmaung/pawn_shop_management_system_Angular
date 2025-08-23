import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../services/pipes/translate.pipe';
import { TranslationService } from '../../../services/TranslationService';
import { ProfileService } from '../../../services/ProfileService';
import { ToastService } from '../../../services/ToastService';
import { firstValueFrom, Observable } from 'rxjs';
import { CustomValidators } from '../../commons/validators/customerValidators';
import { environment } from '../../commons/api.config';

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
  currentProfilePicUrl: string | null = null;
  isEditing = false;
  isLoading = false;
  isUploadingImage = false;
  showDebugInfo = true;

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
    private toastService: ToastService 
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      nrc: ['', [Validators.required, CustomValidators.nrcValidator()]],
      phone: ['', [Validators.required, CustomValidators.phoneNumberValidator()]],
      dob: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      userid: [1] // Default userid
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadMockProfile(): void {
    const mockProfile = {
      name: 'John Doe',
      nrc: '12/MaYaKa(N)123456',
      phone: '09123456789',
      dob: '1990-01-01',
      gender: 'male',
      profilePic: 'https://your-s3-bucket.s3.amazonaws.com/profile-pics/user-123.jpg',
      userid: 1
    };
    
    this.profileForm.patchValue(mockProfile);
    this.currentProfilePicUrl = mockProfile.profilePic || null;
    this.previewUrl = mockProfile.profilePic || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      const validation = this.profileService.validateImageFile(file);
      if (!validation.valid) {
        this.toastService.showError('Invalid File', validation.error || 'Invalid file selected');
        return;
      }
      
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = (e.target?.result as string) || null;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleEdit(): void {
    if (this.isEditing && this.profileForm.dirty) {
      const confirmMessage = 'You have unsaved changes. Do you want to discard them?';
      if (confirm(confirmMessage)) {
        this.cancelEdit();
      }
    } else {
      this.isEditing = !this.isEditing;
    }
  }

  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }

  onSubmit(): void {

    if (this.profileForm.valid && !this.isLoading && !this.isUploadingImage) {
      this.isLoading = true;
      
      // Ensure userid is set
      if (!this.profileForm.value.userid) {
        this.profileForm.patchValue({ userid: 1 });
      }
      
      if (this.selectedFile) {
        this.uploadImageThenSaveProfile();
      } else {
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
      this.isUploadingImage = true;
      
      this.toastService.showInfo(
        'Uploading Image...',
        'Please wait while we upload your image.'
      );
      
      const imageUrl = await this.uploadImageOnly();
      
      this.toastService.showSuccess(
        'Image Uploaded!',
        'Image uploaded successfully. Now saving your profile...'
      );
      
      this.saveProfileData(imageUrl);
      
    } catch (error) {
      this.handleUploadError(error);
    }
  }

  private async uploadImageOnly(): Promise<string> {
    if (!this.selectedFile) {
      throw new Error('No file selected');
    }
    
    try {
      const validation = this.profileService.validateImageFile(this.selectedFile);
      if (!validation.valid) {
        throw new Error(validation.error || 'File validation failed');
      }

      const imageName = await new Promise<string>((resolve, reject) => {
        const formData = {
          file: this.selectedFile!,
          userid: this.profileForm.value.userid,
          name: this.profileForm.value.name || 'Unknown User'
        };
                
        this.profileService.uploadImageOnly(
          formData.file,
          formData.userid,
          formData.name
        ).subscribe({
          next: (res: any) => {

            if (res && res.success === 1 && res.data) {
              const fileName = res.data;
              resolve(fileName);
            } else {
              reject(new Error('Upload response missing data field or failed'));
            }
          },
          error: (error) => {
            reject(error);
          }
        });
      });

      return imageName;
      
    } catch (error) {
      throw error;
    } finally {
      this.isUploadingImage = false;
    }
  }

  private saveProfileData(profilePicUrl: string | null): void {
    const profileData = {
      profilePic: profilePicUrl,
      name: this.profileForm.value.name,
      nrc: this.profileForm.value.nrc,
      phone: this.profileForm.value.phone,
      dob: this.profileForm.value.dob,
      gender: this.profileForm.value.gender,
      userid: this.profileForm.value.userid || 1
    };

    this.profileService.uploadProfileData(profileData).subscribe({
      next: (response) => {
        this.handleSaveSuccess(response, profilePicUrl);
      },
      error: (error) => {
        this.handleSaveError(error);
      }
    });
  }

    // Update handleSaveSuccess method
  // private handleSaveSuccess(response: any, profilePicUrl: string | null): void {
  //   this.toastService.showSuccess(
  //     'Profile Saved!',
  //     response.message || 'Your profile has been successfully updated.'
  //   );
    
  //   console.log('✅ Profile saved successfully:', response);
  //   console.log('🖼️ Profile pic from response:', response.data?.profilePic);
    
  //   // Reset states first
  //   this.selectedFile = null;
  //   this.isEditing = false;
  //   this.isLoading = false;
  //   this.isUploadingImage = false;
    
  //   // Mark form as pristine
  //   this.profileForm.markAsPristine();
    
  //   // 🔥 IMPORTANT: Update the current profile pic URL from the backend response
  //   if (response.data && response.data.profilePic) {
  //     this.currentProfilePicUrl = this.profileService.constructImageUrl(response.data.profilePic);
  //     this.previewUrl = this.currentProfilePicUrl;
  //     console.log('🎯 Updated profile pic URL from response:', this.currentProfilePicUrl);
  //   }
    
  //   // Reload profile to ensure everything is in sync
  //   setTimeout(() => {
  //     this.loadProfile();
  //   }, 500); // Small delay to ensure backend has processed
  // }

  private async handleSaveSuccess(response: any, profilePicUrl: string | null): Promise<void> {
  this.toastService.showSuccess(
    'Profile Saved!',
    response.message || 'Your profile has been successfully updated.'
  );
    
  // Reset states first
  this.selectedFile = null;
  this.isEditing = false;
  this.isLoading = false;
  this.isUploadingImage = false;
  
  // Mark form as pristine
  this.profileForm.markAsPristine();
  
  // 🔥 IMPORTANT: If we got a new profilePic filename from the response, get its S3 URL
  if (response.data && response.data.profilePic) {
    try {
      const s3Url = await this.profileService.constructImageUrlAsync(response.data.profilePic);
      if (s3Url) {
        this.currentProfilePicUrl = s3Url;
        this.previewUrl = s3Url;
      }
    } catch (error) {
    }
  }
  
  // Reload profile to ensure everything is in sync
  setTimeout(() => {
    this.loadProfile();
  }, 500);
}

  // private handleSaveSuccess(response: any, profilePicUrl: string | null): void {
  //   this.toastService.showSuccess(
  //     'Profile Saved!',
  //     response.message || 'Your profile has been successfully updated.'
  //   );
    
  //   console.log('✅ Profile saved successfully:', response);
    
  //   // Reset all states
  //   this.currentProfilePicUrl = profilePicUrl;
  //   this.previewUrl = profilePicUrl;
  //   this.selectedFile = null;
  //   this.isEditing = false;
  //   this.isLoading = false;
  //   this.isUploadingImage = false;
    
  //   // Mark form as pristine
  //   this.profileForm.markAsPristine();
  // }

  private handleSaveError(error: any): void {
    let errorMsg = 'Failed to save profile';
    
    if (error.status === 400) {
      errorMsg = 'Invalid profile data. Please check your inputs.';
    } else if (error.status === 401) {
      errorMsg = 'Session expired. Please login again.';
    } else if (error.status === 413) {
      errorMsg = 'File too large. Please select a smaller image.';
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    this.toastService.showError('Save Failed!', errorMsg);    
    // Reset loading states
    this.isLoading = false;
    this.isUploadingImage = false;
  }

  private handleUploadError(error: any): void {
    let errorMsg = 'Failed to upload image';
    
    if (error.message) {
      errorMsg = error.message;
    }
    
    this.toastService.showError('Upload Failed!', errorMsg);
    
    // Reset loading states
    this.isLoading = false;
    this.isUploadingImage = false;
  }

  retryProfileUpdate(): void {
    if (this.selectedFile) {
      this.uploadImageThenSaveProfile();
    } else {
      this.saveProfileData(this.currentProfilePicUrl);
    }
  }

  loadProfile(): void {
  const userid = 1;
  
  this.profileService.getProfile(userid).subscribe({
    next: async (profile) => {
      
      this.profileForm.patchValue({
        name: profile.name || '',
        nrc: profile.nrc || '',
        phone: profile.phone || '',
        dob: profile.dob || '',
        gender: profile.gender || '',
        userid: profile.userid || userid
      });
      
      // 🔥 FIXED: Get actual S3 URL from backend
      if (profile.profilePic && typeof profile.profilePic === 'string' && profile.profilePic.trim() !== '') {        
        try {
          // Get the actual S3 URL from your backend
          const s3Url = await this.profileService.constructImageUrlAsync(profile.profilePic);          
          this.currentProfilePicUrl = s3Url;
          this.previewUrl = s3Url;
          
          
        } catch (error) {
          this.currentProfilePicUrl = null;
          this.previewUrl = null;
        }
      } else {
        this.currentProfilePicUrl = null;
        this.previewUrl = null;
      }
      
      // console.log('🎯 FINAL URLs after loadProfile:', {
      //   currentProfilePicUrl: this.currentProfilePicUrl,
      //   previewUrl: this.previewUrl,
      //   willShowDefaultAvatar: !this.currentProfilePicUrl
      // });

      if (!this.isEditing) {
        this.toastService.showSuccess(
          'Profile Loaded',
          'Profile data loaded successfully.'
        );
      }
      
      this.userInfo = {
        email: profile.email || null,
        usageTime: profile.usageTime || null
      };
    },
    error: (error) => {
      
      if (error.message && error.message.includes('Profile not found')) {
        
        this.profileForm.patchValue({
          userid: userid,
          name: '',
          nrc: '',
          phone: '',
          dob: '',
          gender: ''
        });
        
        this.toastService.showInfo(
          'No Profile Found',
          'Please fill in your profile information.'
        );
        
        this.isEditing = true;
        
      } else {
        this.toastService.showError(
          'Load Failed',
          error.message || 'Failed to load profile data. Using default data.'
        );
        this.loadMockProfile();
      }
    }
  });
}

  // loadProfile(): void {
  //   const userid = 1;
  //   console.log('🔍 Loading profile for userid:', userid);
    
  //   this.profileService.getProfile(userid).subscribe({
  //     next: (profile) => {
  //       console.log('✅ Received profile data:', profile);
        
  //       this.profileForm.patchValue({
  //         name: profile.name || '',
  //         nrc: profile.nrc || '',
  //         phone: profile.phone || '',
  //         dob: profile.dob || '',
  //         gender: profile.gender || '',
  //         userid: profile.userid || userid
  //       });
        
  //       this.currentProfilePicUrl = profile.profilePic ? 
  //         `${this.profileService.getBaseImageUrl()}/${profile.profilePic}` : null;
  //       this.previewUrl = this.currentProfilePicUrl;

  //       this.toastService.showSuccess(
  //         'Profile Loaded',
  //         'Profile data loaded successfully.'
  //       );
        
  //       this.userInfo = {
  //         email: profile.email || null,
  //         usageTime: profile.usageTime || null
  //       };
  //     },
  //     error: (error) => {
  //       console.error('❌ Error loading profile:', error);
        
  //       // Check if it's a "profile not found" error
  //       if (error.message && error.message.includes('Profile not found')) {
  //         console.log('📝 No profile found - setting up for new profile creation');
          
  //         // Initialize form with userid for new profile
  //         this.profileForm.patchValue({
  //           userid: userid,
  //           name: '',
  //           nrc: '',
  //           phone: '',
  //           dob: '',
  //           gender: ''
  //         });
          
  //         this.toastService.showInfo(
  //           'No Profile Found',
  //           'Please fill in your profile information.'
  //         );
          
  //         // Automatically enable editing mode for new profiles
  //         this.isEditing = true;
          
  //       } else {
  //         // Other errors - show error and use mock data
  //         this.toastService.showError(
  //           'Load Failed',
  //           error.message || 'Failed to load profile data. Using default data.'
  //         );
  //         this.loadMockProfile();
  //       }
  //     }
  //   });
  // }

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
    this.previewUrl = this.currentProfilePicUrl;
    this.isLoading = false;
    this.isUploadingImage = false;
    
    // Reset form to pristine state and reload profile
    this.profileForm.reset();
    this.loadProfile();
  }

  getProfilePicUrl(): string {
    const imageUrl = this.previewUrl || this.currentProfilePicUrl;
    if (!imageUrl) {
    }
    return imageUrl || '/assets/images/profile/defaultAvatar.png';
  }

    // Add debugging method to check image loading
  onImageLoad(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
  }


  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/profile/defaultAvatar.png';
  }

  getNrcErrorMessage(): string {
    const nrcControl = this.profileForm.get('nrc');
    return CustomValidators.getNrcErrorMessage(nrcControl?.errors || null);
  }
    // Get Phone error message  
  getPhoneErrorMessage(): string {
    const phoneControl = this.profileForm.get('phone');
    return CustomValidators.getPhoneErrorMessage(phoneControl?.errors || null);
  }
  

}