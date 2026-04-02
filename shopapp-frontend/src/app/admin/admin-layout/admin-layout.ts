import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { UserService } from '../../service/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  template: `
    <div class="admin-wrapper d-flex">
      <!-- Sidebar -->
      <aside class="sidebar shadow-lg d-flex flex-column">
        <div class="sidebar-header p-4 d-flex align-items-center">
          <div class="logo-box me-3">
             <i class="fa-solid fa-bolt-lightning fs-4 text-white"></i>
          </div>
          <span class="fs-4 fw-800 text-white tracking-tight">SHOP<span class="text-primary-light">ADMIN</span></span>
        </div>

        <nav class="sidebar-nav px-3 flex-grow-1 mt-3">
          <div class="nav-section-label">MENU CHÍNH</div>
          <ul class="nav nav-pills flex-column gap-2 mb-auto">
            <li class="nav-item">
              <a routerLink="/admin/products" routerLinkActive="active" class="nav-link py-3 px-4 d-flex align-items-center">
                <i class="fa-solid fa-cubes me-3 fs-5"></i>
                <span>Sản phẩm</span>
              </a>
            </li>
            <li>
              <a routerLink="/admin/categories" routerLinkActive="active" class="nav-link py-3 px-4 d-flex align-items-center">
                <i class="fa-solid fa-layer-group me-3 fs-5"></i>
                <span>Danh mục</span>
              </a>
            </li>
            <li>
              <a routerLink="/admin/banners" routerLinkActive="active" class="nav-link py-3 px-4 d-flex align-items-center">
                <i class="fa-solid fa-film me-3 fs-5"></i>
                <span>Quản lý Banner</span>
              </a>
            </li>
            <li>
              <a routerLink="/admin/orders" routerLinkActive="active" class="nav-link py-3 px-4 d-flex align-items-center">
                <i class="fa-solid fa-receipt me-3 fs-5"></i>
                <span>Đơn hàng</span>
              </a>
            </li>
          </ul>

          <div class="nav-section-label mt-5">Hệ thống</div>
           <button class="btn logout-btn w-100 mt-2 py-3 d-flex align-items-center px-4" (click)="logout()">
              <i class="fa-solid fa-power-off me-3 fs-5"></i>
              <span>Đăng xuất</span>
           </button>
        </nav>

        <div class="sidebar-footer p-4">
           <div class="user-card d-flex align-items-center p-3 rounded-4 bg-white bg-opacity-10">
              <div class="avatar-sm me-3">A</div>
              <div class="user-info overflow-hidden">
                 <div class="name text-white text-truncate small fw-bold">Quản trị viên</div>
                 <div class="role text-white text-opacity-50 smaller">Super Admin</div>
              </div>
           </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="main-content flex-grow-1 overflow-hidden d-flex flex-column">
        <!-- Modern Header -->
        <header class="main-header px-4 py-3 d-flex justify-content-between align-items-center">
          <div class="header-left d-flex align-items-center">
            <button class="btn btn-icon me-3 d-lg-none">
              <i class="fa-solid fa-bars"></i>
            </button>
            <div class="search-bar position-relative d-none d-md-block">
               <i class="fa-solid fa-magnifying-glass position-absolute top-50 translate-middle-y ms-3 text-muted opacity-50"></i>
               <input type="text" class="form-control rounded-pill border-0 bg-light ps-5" placeholder="Tìm kiếm...">
            </div>
          </div>
          
          <div class="header-right d-flex align-items-center gap-3">
             <button class="btn-icon rounded-circle position-relative">
                <i class="fa-regular fa-bell"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-2 border-white" style="font-size: 8px;">
                  3
                </span>
             </button>
             <div class="v-divider"></div>
             <div class="d-flex align-items-center cursor-pointer">
                <span class="me-3 fw-semibold text-dark d-none d-sm-inline">Admin User</span>
                <div class="avatar-md bg-gradient-brand text-white shadow-brand-sm">A</div>
             </div>
          </div>
        </header>

        <!-- Dynamic Content -->
        <main class="page-container flex-grow-1 overflow-auto p-4 p-lg-5">
           <div class="fade-in-up">
              <router-outlet></router-outlet>
           </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --sidebar-width: 300px;
      --sidebar-bg: #0f172a; /* Slate 900 */
      --brand-primary: #6366f1; /* Indigo 500 */
      --brand-secondary: #a855f7; /* Violet 500 */
      --text-muted: #64748b;
      --bg-main: #f8fafc;
      --header-height: 80px;
    }

    .admin-wrapper {
      min-height: 100vh;
      background: var(--bg-main);
      overflow-x: hidden;
    }

    /* Sidebar Styling */
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--sidebar-bg);
      position: sticky;
      top: 0;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1001;
    }

    .logo-box {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
    }

    .tracking-tight { letter-spacing: -0.5px; }
    .text-primary-light { color: #818cf8; }
    .fw-800 { font-weight: 800; }

    .nav-section-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      padding: 0 1.5rem;
      margin-bottom: 0.5rem;
      letter-spacing: 1px;
    }

    .nav-link {
      color: rgba(255,255,255,0.7);
      border-radius: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      position: relative;
    }

    .nav-link:hover {
      color: white;
      background: rgba(255,255,255,0.05);
      transform: translateX(5px);
    }

    .nav-link.active {
      background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%) !important;
      color: white !important;
      font-weight: 600;
      box-shadow: 0 10px 20px rgba(99, 102, 241, 0.25);
    }

    .logout-btn {
      color: #fca5a5;
      background: transparent;
      border: 1px solid rgba(252, 165, 165, 0.1);
      border-radius: 14px;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
      color: #ef4444;
    }

    /* Main Content Styling */
    .main-header {
      height: var(--header-height);
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0,0,0,0.04);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .search-bar .form-control {
       width: 300px;
       padding-top: 10px;
       padding-bottom: 10px;
       font-size: 0.9rem;
       transition: all 0.3s ease;
    }
    
    .search-bar .form-control:focus {
       background: white;
       box-shadow: 0 4px 12px rgba(0,0,0,0.05);
       width: 350px;
    }

    .btn-icon {
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      color: var(--text-muted);
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: #f1f5f9;
      color: var(--brand-primary);
      border-color: var(--brand-primary);
    }

    .v-divider {
      width: 1px;
      height: 24px;
      background: #e2e8f0;
    }

    .avatar-sm {
       width: 36px;
       height: 36px;
       border-radius: 10px;
       background: rgba(255,255,255,0.2);
       display: flex;
       align-items: center;
       justify-content: center;
       font-weight: bold;
       color: white;
    }

    .avatar-md {
       width: 48px;
       height: 48px;
       border-radius: 14px;
       display: flex;
       align-items: center;
       justify-content: center;
       font-weight: 700;
       font-size: 1.2rem;
    }

    .bg-gradient-brand {
       background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
    }

    .shadow-brand-sm {
       box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
    }

    .smaller { font-size: 0.75rem; }

    /* Animations */
    .fade-in-up {
      animation: fadeInUp 0.5s ease-out;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 992px) {
       .sidebar {
          width: 0;
          overflow: hidden;
          position: fixed;
       }
       .sidebar.open {
          width: var(--sidebar-width);
       }
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

