import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { SessionStore } from "../../application/store/session-store";

export const authGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  
  return session.isAuthenticated()
    ? true
    : router.createUrlTree(['/auth/login']);
};