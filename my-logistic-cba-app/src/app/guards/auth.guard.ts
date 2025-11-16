import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');

  if (token) {
    // User is authenticated
    return true;
  } else {
    // User is not authenticated, redirect to login
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
