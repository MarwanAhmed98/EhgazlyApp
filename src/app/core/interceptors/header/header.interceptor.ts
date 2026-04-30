import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  const token = isBrowser ? localStorage.getItem('token') : null;
  let headersConfig: any = {
    'ngrok-skip-browser-warning': 'true'
  };
  if (token) {
    headersConfig['Authorization'] = `Bearer ${token}`;
    console.log(token);

  }
  const isFormData = req.body instanceof FormData;
  if (!isFormData) {
    headersConfig['Content-Type'] = 'application/json';
  }
  const authReq = req.clone({
    setHeaders: headersConfig
  });

  return next(authReq);
};