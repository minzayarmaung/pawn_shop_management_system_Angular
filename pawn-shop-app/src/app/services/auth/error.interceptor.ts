import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Clear user data and redirect to login
        authService.clearUserData();
        router.navigate(['/login']);
      }
      
      if (error.status === 403) {
        console.error('Access forbidden:', error.error?.message);
      }

      if (error.status === 500) {
        console.error('Server error:', error.error?.message);
      }

      return throwError(() => error);
    })
  );
};