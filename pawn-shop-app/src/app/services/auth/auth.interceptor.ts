import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Endpoints that don't need authentication
  const publicEndpoints = [
    '/auth/user', // login
    '/auth/user/send-otp',
    '/auth/user/verify-otp',
    '/auth/user/sign-up',
    '/auth/user/forgot-password',
    '/auth/user/reset-password'
  ];

  // Check if request is to a public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint =>
    req.url.includes(endpoint)
  );

  if (isPublicEndpoint) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getValidToken(); 

  // Attach token if available and valid
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
