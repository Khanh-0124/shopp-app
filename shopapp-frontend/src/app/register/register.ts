import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FooterComponent } from "../footer/footer";
import { HeaderComponent } from "../header/header";
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { routes } from '../app.routes';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-register',
  imports: [FooterComponent, HeaderComponent, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {

  // State signals
  phone = signal<string>('');
  password = signal<string>('');
  retypePassword = signal<string>('');
  fullName = signal<string>('');
  address = signal<string>('');
  isAccepted = signal<boolean>(false);
  dateOfBirth = signal<string>(this.getDefaultDob());

  // Error signals
  phoneError = signal<string>('');
  passwordError = signal<string>('');
  retypePasswordError = signal<string>('');
  fullNameError = signal<string>('');
  addressError = signal<string>('');
  dateOfBirthError = signal<string>('');

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  private getDefaultDob(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split('T')[0];
  }

  // Regex cho số điện thoại Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)
  validatePhone(phone: string): boolean {
    const phoneRegex = /^(03|05|07|08|09)+([0-9]{8})$/;
    return phoneRegex.test(phone);
  }

  onPhoneChange() {
    const val = this.phone();
    if (!val) {
      this.phoneError.set('Số điện thoại không được để trống');
    } else if (!this.validatePhone(val)) {
      this.phoneError.set('Số điện thoại không đúng định dạng Việt Nam');
    } else {
      this.phoneError.set('');
    }
  }

  onPasswordChange() {
    const val = this.password();
    if (val.length < 3) {
      this.passwordError.set('Mật khẩu phải có ít nhất 3 ký tự');
    } else {
      this.passwordError.set('');
    }
    this.onRetypePasswordChange();
  }

  onRetypePasswordChange() {
    const val = this.retypePassword();
    if (val !== this.password()) {
      this.retypePasswordError.set('Mật khẩu nhập lại không khớp');
    } else if (val.length < 3) {
      this.retypePasswordError.set('Mật khẩu nhập lại phải có ít nhất 3 ký tự');
    } else {
      this.retypePasswordError.set('');
    }
  }

  onFullNameChange() {
    if (this.fullName().length < 3) {
      this.fullNameError.set('Họ và tên phải có ít nhất 3 ký tự');
    } else {
      this.fullNameError.set('');
    }
  }

  onAddressChange() {
    if (this.address().length < 3) {
      this.addressError.set('Địa chỉ phải có ít nhất 3 ký tự');
    } else {
      this.addressError.set('');
    }
  }

  onDateOfBirthChange() {
    const dob = new Date(this.dateOfBirth());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dob > today) {
      this.dateOfBirthError.set('Ngày sinh không được lớn hơn ngày hiện tại');
    } else {
      this.dateOfBirthError.set('');
    }
  }

  validateForm(): boolean {
    this.onPhoneChange();
    this.onPasswordChange();
    this.onRetypePasswordChange();
    this.onFullNameChange();
    this.onAddressChange();
    this.onDateOfBirthChange();

    return !this.phoneError() &&
      !this.passwordError() &&
      !this.retypePasswordError() &&
      !this.fullNameError() &&
      !this.addressError() &&
      !this.dateOfBirthError();
  }

  register() {
    if (this.validateForm() && this.isAccepted()) {

      const registerData = {
        "fullname": this.fullName(),
        "phone_number": this.phone(),
        "address": this.address(),
        "password": this.password(),
        "retype_password": this.retypePassword(),
        "date_of_birth": this.dateOfBirth(),
        "facebook_account_id": 0,
        "google_account_id": 0,
        "role_id": 1
      }
      this.userService.register(registerData).subscribe({
        next: (response) => {
          console.log(response);
          alert("Đăng ký thành công!");
          this.navigateToLogin();
        },
        error: (error) => {
          console.log(error);
          alert("Đăng ký thất bại!");
        }
      })
    } else if (!this.isAccepted()) {
      alert("Bạn phải đồng ý với các điều khoản");
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
