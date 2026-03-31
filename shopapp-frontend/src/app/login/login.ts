import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../header/header";
import { FooterComponent } from "../footer/footer";
import { UserService } from '../service/user.service';
import { ToastService } from '../service/toast.service';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FooterComponent, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  phoneNumber = signal<string>('');
  password = signal<string>('');
  roleId = signal<number>(1);
  showPassword = signal<boolean>(false);
  
  private router = inject(Router);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  login() {
    const loginData = {
      phone_number: this.phoneNumber(),
      password: this.password()
    };

    this.userService.login(loginData).subscribe({
      next: (response) => {
        if (response.token) {
          // Lấy thông tin role từ user details để đảm bảo guard hoạt động ngay
          this.userService.getUserDetails(response.token).subscribe({
            next: (userResponse) => {
              if (userResponse.role) {
                this.userService.saveRole(userResponse.role.name.toUpperCase());
              }
              this.router.navigate(['/home']);
            },
            error: () => this.router.navigate(['/home']) // Vẫn cho vào nếu fail details
          });
        }
      },
      error: (err) => {
        alert('Đăng nhập thất bại: ' + (err.error?.message || err.message));
      }
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
