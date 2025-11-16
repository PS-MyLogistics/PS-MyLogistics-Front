import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

/**
 * Guard to prevent DEALER users from accessing certain routes
 */
export const noDealerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Check if user is a dealer
  if (authService.hasRole(Role.DEALER)) {
    // Dealer users cannot access this route, redirect to dashboard home
    router.navigate(['/dashboard']);
    return false;
  }

  // Allow access for non-dealer users
  return true;
};
