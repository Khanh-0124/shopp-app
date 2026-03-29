import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../service/user.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  if (userService.isLoggedIn() && userService.isAdmin()) {
    return true;
  }

  // If not admin, redirect to login or home
  alert("Bạn không có quyền truy cập trang này!");
  router.navigate(['/login']);
  return false;
};
