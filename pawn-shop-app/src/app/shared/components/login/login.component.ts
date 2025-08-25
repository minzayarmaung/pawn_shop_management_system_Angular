import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/ToastService';
import { Login } from '../../../models/login.model';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', [Validators.required]]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData: Login = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success === 1) {
            this.toastService.showSuccess(
              'Login Successful!',
              'Welcome back! You have been logged in successfully.'
            );
            
            // Store user data or token if needed
            localStorage.setItem('user', JSON.stringify(response.data));
            
            // Navigate to dashboard or home page
            this.router.navigate(['/dashboard']);
          } else {
            this.toastService.showError(
              'Login Failed',
              response.message || 'Invalid credentials. Please try again.'
            );
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          this.toastService.showError(
            'Login Error',
            error.error?.message || 'An error occurred during login. Please try again.'
          );
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  continueWithGoogle(): void {
    // TODO: Implement Google login
    this.toastService.showInfo(
      'Coming Soon',
      'Google login will be implemented soon!'
    );
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}