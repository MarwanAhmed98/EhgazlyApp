import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastrService = inject(ToastService);
  return next(req).pipe(catchError((err) => {
    toastrService.error(err.error.message, 'Ehgazly');
    return throwError(() => err)
  }));
};
