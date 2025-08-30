import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
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

export interface LoginResponse {
  user: any;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth/user`;
  private isBrowser: boolean;

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // initialize auth state only in browser
    if (this.isBrowser) {
      this.isLoggedInSubject.next(this.hasValidToken());
    }
  }

  /**
   * Safe localStorage get
   */
  private getFromStorage(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  /**
   * Safe localStorage set
   */
  private setToStorage(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }

  /**
   * Safe localStorage remove
   */
  private removeFromStorage(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  private hasValidToken(): boolean {
    const token = this.getFromStorage('auth_token');
    const user = this.getFromStorage('user');
    return !!(token && user);
  }

  // Method to get token only if it's still valid
  getValidToken(): string | null {
    if (!this.isBrowser) return null;
    
    const tokenDataStr = localStorage.getItem('auth_token');
    if (!tokenDataStr) return null;
    
    try {
      const tokenData = JSON.parse(tokenDataStr);
      const currentTime = new Date().getTime();
      
      // Check if token has expired
      if (currentTime > tokenData.expiration) {
        // Token expired, remove it
        this.logout();
        return null;
      }
      
      return tokenData.token;
    } catch (error) {
      // Invalid token data format, remove it
      this.logout();
      return null;
    }
  }

  private setTokenWithExpiration(token: string): void {
  if (this.isBrowser) {
    const expirationTime = new Date().getTime() + (12 * 60 * 60 * 1000); // 12 hours in milliseconds
    const tokenData = {
      token: token,
      expiration: expirationTime
    };
    localStorage.setItem('auth_token', JSON.stringify(tokenData));
  }
}

  private checkAuthState(): void {
    this.isLoggedInSubject.next(this.hasValidToken());
  }

  login(loginData: Login): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, loginData).pipe(
      tap(response => {
        if (response.success === 1 && response.data) {
          // Set token with 12-hour expiration
          this.setTokenWithExpiration(response.data.token);
          this.setToStorage('user', JSON.stringify(response.data.user));
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  sendOTP(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/send-otp`, { email });
  }

  verifyOTP(email: string, otp: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  signup(signupData: Signup): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/sign-up`, signupData);
  }

  forgotPassword(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, { token, newPassword });
  }

  getProfile(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/profile/getProfileData`);
  }

  logout(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearUserData();
      })
    );
  }

  logoutLocal(): void {
    this.clearUserData();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  getCurrentUser(): any {
    try {
      const user = this.getFromStorage('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.clearUserData();
      return null;
    }
  }

  refreshTokenExpiration(): void {
    const currentToken = this.getValidToken();
    if (currentToken) {
      this.setTokenWithExpiration(currentToken);
    }
  }

  getToken(): string | null {
    return this.getFromStorage('auth_token');
  }

  clearUserData(): void {
    this.removeFromStorage('user');
    this.removeFromStorage('auth_token');
    this.isLoggedInSubject.next(false);
  }
}
