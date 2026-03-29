import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { UserService } from '../../service/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="d-flex" style="min-height: 100vh; background: #f8f9fa;">
      <!-- Sidebar -->
      <div class="sidebar bg-dark text-white p-3" style="width: 280px; transition: all 0.3s; box-shadow: 2px 0 10px rgba(0,0,0,0.1);">
        <a routerLink="/home" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <i class="fa-solid fa-shop me-2 fs-4 text-primary"></i>
          <span class="fs-4 fw-bold">ShopAdmin</span>
        </a>
        <hr>
        <ul class="nav nav-pills flex-column mb-auto">
          <li class="nav-item">
            <a routerLink="/admin/products" routerLinkActive="active" class="nav-link text-white py-3 my-1 rounded-3 d-flex align-items-center">
              <i class="fa-solid fa-box-open me-3 fs-5"></i>
              Sản phẩm
            </a>
          </li>
          <li>
            <a routerLink="/admin/categories" routerLinkActive="active" class="nav-link text-white py-3 my-1 rounded-3 d-flex align-items-center">
              <i class="fa-solid fa-list-ul me-3 fs-5"></i>
              Danh mục
            </a>
          </li>
          <li>
            <a href="#" class="nav-link text-white py-3 my-1 rounded-3 d-flex align-items-center">
              <i class="fa-solid fa-users me-3 fs-5"></i>
              Người dùng (Sắp ra mắt)
            </a>
          </li>
          <li>
            <a href="#" class="nav-link text-white py-3 my-1 rounded-3 d-flex align-items-center">
              <i class="fa-solid fa-chart-line me-3 fs-5"></i>
              Thống kê (Sắp ra mắt)
            </a>
          </li>
        </ul>
        <hr>
        <div class="p-3">
          <button class="btn btn-outline-danger w-100 rounded-pill fw-bold" (click)="logout()">
            <i class="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-grow-1 p-4 overflow-auto" style="height: 100vh;">
        <header class="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
          <h4 class="mb-0 fw-bold text-dark">Bảng điều khiển</h4>
          <div class="d-flex align-items-center">
            <span class="me-3 fw-medium text-muted">Admin User</span>
            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 45px; height: 45px;">
              A
            </div>
          </div>
        </header>
        <main>
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(5px);
    }
    .nav-link.active {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
      font-weight: bold;
      box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
    }
    .nav-link {
       transition: all 0.3s ease;
    }
    .sidebar {
      z-index: 1000;
    }
  `]
})
export class AdminLayoutComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  logout() {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
