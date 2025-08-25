import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/ToastService';
import { Signup } from '../../../models/signup.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  currentStep = 1;
  emailForm!: FormGroup;
  signupForm!: FormGroup;
  
  showPassword = false;
  showConfirmPassword = false;
  
  otpSent = false;
  isSendingOTP = false;
  isVerifyingOTP = false;
  isLoading = false;
  
  resendTimer = 0;
  private timerSubscription?: Subscription;

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

    // Signup form
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validator for password matching
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
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

      this.authService.sendOTP(email).subscribe({
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
            this.signupForm.get('email')?.setValue(email);
            
            this.toastService.showSuccess(
              'Email Verified!',
              'Please complete your account details.'
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

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      const signupData: Signup = {
        username: this.signupForm.get('username')?.value,
        email: this.signupForm.get('email')?.value,
        password: this.signupForm.get('password')?.value,
        role: this.signupForm.get('role')?.value
      };

      this.authService.signup(signupData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success === 1) {
            this.toastService.showSuccess(
              'Account Created!',
              'Your account has been created successfully. Please log in.'
            );
            
            // Navigate to login page
            this.router.navigate(['/login']);
          } else {
            this.toastService.showError(
              'Signup Failed',
              response.message || 'Failed to create account. Please try again.'
            );
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Signup error:', error);
          this.toastService.showError(
            'Signup Error',
            error.error?.message || 'An error occurred during signup. Please try again.'
          );
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  goBack(): void {
    this.currentStep = 1;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }
}