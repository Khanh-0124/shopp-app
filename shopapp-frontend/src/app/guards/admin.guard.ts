import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UserService } from '../service/user.service';
import { ToastService } from '../service/toast.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (userService.isAdmin()) {
    return true;
  } else {
    toastService.warning("Bạn không có quyền truy cập trang này!");
    router.navigate(['/']);
    return false;
  }
};
