import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { isPlatformBrowser } from '@angular/common';

/**
 * Auth Guard - Protects routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Store redirect URL only in browser
    if (isBrowser) {
      localStorage.setItem('redirectUrl', state.url);
    }

    // Redirect to login page
    router.navigate(['/login']);
    return false;
  }
};

/**
 * Guest Guard - Redirects authenticated users away from auth pages (login, signup, etc.)
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  } else {
    // Redirect authenticated users to dashboard or home
    router.navigate(['/dashboard']); // Change this to your desired route
    return false;
  }
};
