import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Login } from '../../models/login.model';
import { Signup } from '../../models/signup.model';
import { environment } from '../../shared/commons/api.config';

export interface ApiResponse<T = any> {
  success: number;
  code: number;
  meta: {
    endpoint: string;
    method: string;
  };
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth/user`;
  private http = inject(HttpClient);

  /**
   * Login user
   */
  login(loginData: Login): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}`, loginData);
  }

  /**
   * Send OTP to email for verification
   */
  sendOTP(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/send-otp`, { email });
  }

  /**
   * Verify OTP
   */
  verifyOTP(email: string, otp: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  /**
   * Register new user
   */
  signup(signupData: Signup): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/signup`, signupData);
  }

  /**
   * Send password reset email
   */
  forgotPassword(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, { 
      token, 
      newPassword 
    });
  }

  /**
   * Get user profile
   */
  getProfile(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/profile/getProfileData`);
  }

  /**
   * Logout user
   */
  logout(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/logout`, {});
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const user = localStorage.getItem('user');
    return !!user;
  }

  /**
   * Get current user data
   */
  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Clear user data (for logout)
   */
  clearUserData(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}