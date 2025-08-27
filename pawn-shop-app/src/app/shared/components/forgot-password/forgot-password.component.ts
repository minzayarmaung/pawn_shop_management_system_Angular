import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { interval, Subscription, take } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/ToastService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  currentStep = 1;
  emailForm!: FormGroup;
  resetPasswordForm!: FormGroup;
  
  showNewPassword = false;
  showConfirmPassword = false;
  
  otpSent = false;
  isSendingOTP = false;
  isVerifyingOTP = false;
  isResettingPassword = false;
  
  resendTimer = 0;
  private timerSubscription?: Subscription;
  
  private verificationToken = '';

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.initializeForms();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  initializeForms(): void {
    // Email verification form
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['']
    });

    // Reset password form
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for password matching
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  sendOTP(): void {
    if (this.emailForm.get('email')?.valid) {
      this.isSendingOTP = true;
      const email = this.emailForm.get('email')?.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isSendingOTP = false;
          if (response.success === 1) {
            this.otpSent = true;
            this.emailForm.get('otp')?.setValidators([
              Validators.required, 
              Validators.pattern(/^\d{6}$/)
            ]);
            this.emailForm.get('otp')?.updateValueAndValidity();
            
            this.startResendTimer();
            
            this.toastService.showSuccess(
              'OTP Sent!',
              'Please check your email for the verification code.'
            );
          } else {
            this.toastService.showError(
              'Failed to send OTP',
              response.message || 'Please try again later.'
            );
          }
        },
        error: (error) => {
          this.isSendingOTP = false;
          console.error('Send OTP error:', error);
          this.toastService.showError(
            'Error sending OTP',
            error.error?.message || 'An error occurred while sending OTP. Please try again.'
          );
        }
      });
    } else {
      this.emailForm.get('email')?.markAsTouched();
    }
  }

  verifyOTP(): void {
    if (this.emailForm.get('otp')?.valid) {
      this.isVerifyingOTP = true;
      const email = this.emailForm.get('email')?.value;
      const otp = this.emailForm.get('otp')?.value;

      this.authService.verifyOTP(email, otp).subscribe({
        next: (response) => {
          this.isVerifyingOTP = false;
          if (response.success === 1) {
            this.currentStep = 2;
            // Store the verification token from response if your API provides it
            this.verificationToken = response.data?.token || otp; // Fallback to OTP if no token provided
            
            this.toastService.showSuccess(
              'OTP Verified!',
              'Please enter your new password.'
            );
          } else {
            this.toastService.showError(
              'Verification Failed',
              response.message || 'Invalid OTP. Please try again.'
            );
          }
        },
        error: (error) => {
          this.isVerifyingOTP = false;
          console.error('Verify OTP error:', error);
          this.toastService.showError(
            'Verification Error',
            error.error?.message || 'An error occurred during verification. Please try again.'
          );
        }
      });
    } else {
      this.emailForm.get('otp')?.markAsTouched();
    }
  }

  resetPassword(): void {
    if (this.resetPasswordForm.valid) {
      this.isResettingPassword = true;
      const newPassword = this.resetPasswordForm.get('newPassword')?.value;

      this.authService.resetPassword(this.verificationToken, newPassword).subscribe({
        next: (response) => {
          this.isResettingPassword = false;
          if (response.success === 1) {
            this.toastService.showSuccess(
              'Password Reset Successfully!',
              'Your password has been updated. Please log in with your new password.'
            );
            
            // Navigate to login page
            this.router.navigate(['/login']);
          } else {
            this.toastService.showError(
              'Password Reset Failed',
              response.message || 'Failed to reset password. Please try again.'
            );
          }
        },
        error: (error) => {
          this.isResettingPassword = false;
          console.error('Reset password error:', error);
          this.toastService.showError(
            'Reset Password Error',
            error.error?.message || 'An error occurred while resetting password. Please try again.'
          );
        }
      });
    } else {
      this.markFormGroupTouched(this.resetPasswordForm);
    }
  }

  resendOTP(): void {
    if (this.resendTimer === 0) {
      this.sendOTP();
    }
  }

  private startResendTimer(): void {
    this.resendTimer = 60;
    this.timerSubscription = interval(1000)
      .pipe(take(60))
      .subscribe(() => {
        this.resendTimer--;
        if (this.resendTimer === 0 && this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
      });
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goBack(): void {
    if (this.currentStep === 2) {
      this.currentStep = 1;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}