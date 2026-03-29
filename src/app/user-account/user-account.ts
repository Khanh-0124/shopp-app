import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';
import { UserService } from '../service/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-account',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  template: `
    <app-header></app-header>
    <div class="container my-5 pt-5">
      <div class="row justify-content-center">
        <div class="col-md-10 col-lg-8">
          <div class="card border-0 shadow-lg overflow-hidden glass-card">
            
            <!-- User Header Section -->
            <div class="profile-header text-center py-5">
               <div class="avatar-wrapper mb-3">
                 <div class="avatar-circle">
                   <i class="fa-solid fa-user-circle fs-extra-large"></i>
                 </div>
               </div>
               <h2 class="fw-bold mb-1">{{ userData()?.fullname || 'Đang tải...' }}</h2>
               <p class="role-badge">{{ userData()?.role?.name || 'Thành viên' }}</p>
            </div>

            <!-- Profile Details Section -->
            <div class="card-body p-4 p-md-5">
              @if (isEditing()) {
                <!-- Edit mode -->
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="form-group custom-input">
                      <label>Họ và tên</label>
                      <input type="text" class="form-control" [(ngModel)]="editData.fullname">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group custom-input">
                      <label>Số điện thoại (Không thể đổi)</label>
                      <input type="text" class="form-control bg-light" [value]="userData()?.phone_number" readonly disabled>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="form-group custom-input">
                      <label>Địa chỉ</label>
                      <input type="text" class="form-control" [(ngModel)]="editData.address">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group custom-input">
                      <label>Ngày sinh</label>
                      <input type="date" class="form-control" [(ngModel)]="editData.date_of_birth">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group custom-input">
                      <label>Mật khẩu mới (Để trống nếu không đổi)</label>
                      <input type="password" class="form-control" [(ngModel)]="editData.password" placeholder="********">
                    </div>
                  </div>
                </div>
                
                <div class="mt-5 d-flex gap-3 justify-content-center">
                  <button class="btn btn-success rounded-pill px-4 fw-bold" (click)="saveProfile()">
                    <i class="fa-solid fa-check me-2"></i> Lưu thay đổi
                  </button>
                  <button class="btn btn-outline-light text-dark rounded-pill px-4 fw-bold" (click)="isEditing.set(false)">
                    Hủy
                  </button>
                </div>

              } @else {
                <!-- View mode -->
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="info-item">
                      <label>Họ và tên</label>
                      <p>{{ userData()?.fullname || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <label>Số điện thoại</label>
                      <p>{{ userData()?.phone_number || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="info-item">
                      <label>Địa chỉ</label>
                      <p>{{ userData()?.address || '-' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <label>Ngày sinh</label>
                      <p>{{ userData()?.date_of_birth | date:'dd/MM/yyyy' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="info-item">
                      <label>Trạng thái</label>
                      <p>
                        <span class="badge" [class.bg-success]="userData()?.is_active">
                          {{ userData()?.is_active ? 'Đang hoạt động' : 'Tạm khóa' }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="mt-5 d-flex gap-3 justify-content-center">
                  <button class="btn btn-primary px-4 py-2 rounded-pill fw-bold" (click)="startEditing()">
                    <i class="fa-solid fa-pen-to-square me-2"></i> Chỉnh sửa hồ sơ
                  </button>
                  <button class="btn btn-danger px-4 py-2 rounded-pill fw-bold" (click)="logout()">
                    <i class="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    .glass-card {
      background: white;
      border-radius: 30px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.05) !important;
    }
    .profile-header {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
    }
    .avatar-circle {
      width: 100px; height: 100px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center; justify-content: center;
    }
    .fs-extra-large { font-size: 60px; }
    .role-badge {
      background: rgba(255,255,255,0.2);
      display: inline-block;
      padding: 4px 15px;
      border-radius: 20px;
      font-size: 14px;
    }
    .info-item {
      padding: 15px;
      background: #f8fafc;
      border-radius: 15px;
      border: 1px solid #e2e8f0;
    }
    .info-item label {
      display: block;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 5px;
    }
    .info-item p {
      margin: 0;
      font-weight: 600;
      color: #1e293b;
      font-size: 16px;
    }
    .custom-input label {
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 8px;
    }
    .custom-input .form-control {
      border-radius: 12px;
      padding: 12px 15px;
      border: 1px solid #cbd5e1;
    }
    .btn { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .btn:hover { transform: translateY(-3px); }
  `]
})
export class UserAccountComponent implements OnInit {
  userData = signal<any>(null);
  isEditing = signal<boolean>(false);
  editData = {
    fullname: '',
    address: '',
    date_of_birth: '',
    password: '',
    retype_password: '',
    phone_number: ''
  };

  private userService = inject(UserService);
  private router = inject(Router);

  ngOnInit() {
    this.loadUserDetails();
  }

  loadUserDetails() {
    const token = this.userService.getToken();
    if (token) {
      this.userService.getUserDetails(token).subscribe({
        next: (response) => {
          this.userData.set(response);
          // Sync edit data
          this.editData.fullname = response.fullname;
          this.editData.address = response.address;
          this.editData.phone_number = response.phone_number;
          if (response.date_of_birth) {
             this.editData.date_of_birth = new Date(response.date_of_birth).toISOString().split('T')[0];
          }
        },
        error: (err) => {
          console.error('Lỗi khi lấy thông tin user:', err);
          this.logout();
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  startEditing() {
    this.isEditing.set(true);
  }

  saveProfile() {
    const token = this.userService.getToken();
    if (!token) return;

    const userId = this.userData().id;
    // Password check if provided
    if (this.editData.password && this.editData.password.length > 0) {
       this.editData.retype_password = this.editData.password;
    }

    this.userService.updateUser(userId, this.editData, token).subscribe({
      next: (response) => {
        alert('Cập nhật thông tin thành công!');
        this.isEditing.set(false);
        this.loadUserDetails();
      },
      error: (err) => {
        alert('Lỗi cập nhật: ' + (err.error?.message || err.message));
      }
    });
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
