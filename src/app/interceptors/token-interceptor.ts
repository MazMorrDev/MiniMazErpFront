import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const newReq = req.clone({
    headers: req.headers.append('Authorization', `Bearer ${token}`)
  });
  return next(newReq);
};
