import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { TokenStoragePort } from "../../domain/ports/token-storage-port";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStoragePort).get('access-token');
  if (!token) return next(req);
 
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};