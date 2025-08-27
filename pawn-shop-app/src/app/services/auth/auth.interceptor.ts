import { HttpInterceptorFn } from '@angular/common/http';

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

  // ✅ Safe localStorage check
  let token: string | null = null;
  if (typeof window !== 'undefined' && window.localStorage) {
    token = localStorage.getItem('auth_token');
  }

  // Attach token if available
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
