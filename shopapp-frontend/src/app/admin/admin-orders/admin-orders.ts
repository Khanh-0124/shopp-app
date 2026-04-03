import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrdersService } from '../../service/orders.service';
import { ToastService } from '../../service/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="row mb-5 align-items-center">
      <div class="col-md-6">
        <h2 class="fw-800 text-dark mb-1">Quản Lý Đơn Hàng</h2>
        <p class="text-muted small mb-0">Theo dõi và xử lý các yêu cầu từ khách hàng</p>
      </div>
      <div class="col-md-6 mt-3 mt-md-0 d-flex gap-3 justify-content-md-end">
        <div class="search-box-custom position-relative flex-grow-1" style="max-width: 350px;">
           <i class="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
           <input type="text" class="form-control rounded-4 ps-5 py-3 border-0 shadow-sm" 
                  placeholder="Tìm tên, email, địa chỉ..." 
                  [(ngModel)]="keyword" (keyup.enter)="searchOrders()">
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-5 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th scope="col" class="ps-4">Mã Đơn</th>
                <th scope="col">Khách Hàng</th>
                <th scope="col">Ngày Đặt</th>
                <th scope="col">Tổng Tiền</th>
                <th scope="col">Trạng Thái</th>
                <th scope="col" class="text-end pe-4">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
              <tr>
                <td class="ps-4">
                  <span class="text-indigo fw-800">#{{ order.id }}</span>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="fw-700 text-dark">{{ order.full_name }}</span>
                    <span class="text-muted extra-small">{{ order.email }}</span>
                  </div>
                </td>
                <td>
                  <span class="text-muted small fw-600">{{ order.order_date | date:'dd/MM/yyyy' }}</span>
                </td>
                <td>
                  <span class="price-tag fw-bold">{{ order.total_money | currency:'VND':'symbol':'1.0-0' }}</span>
                </td>
                <td>
                  <span class="status-badge" [ngClass]="getStatusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <div class="action-btns d-inline-flex gap-2">
                    <button class="btn btn-icon-sm btn-view shadow-sm" (click)="viewDetails(order.id)" title="Xem chi tiết">
                      <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn btn-icon-sm btn-delete shadow-sm" (click)="deleteOrder(order.id)" title="Xóa">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
              }
              @if (orders().length === 0) {
                <tr>
                  <td colspan="6" class="text-center py-5">
                    <div class="opacity-20 mb-3"><i class="fa-solid fa-box-open fs-1"></i></div>
                    <p class="text-muted fw-600">Chưa có đơn hàng nào được tìm thấy</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Pagination -->
      <div class="card-footer bg-white border-top-0 p-4 d-flex justify-content-between align-items-center">
        <div class="text-muted small fw-600">
           Trang <span class="text-dark fw-800">{{ currentPage() + 1 }}</span> trên <span class="text-dark fw-800">{{ totalPages() }}</span>
        </div>
        <nav>
          <ul class="pagination pagination-custom mb-0">
            <li class="page-item" [class.disabled]="currentPage() === 0">
              <button class="page-link" (click)="onPageChange(currentPage() - 1)">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
            </li>
            <li class="page-item" [class.disabled]="currentPage() >= totalPages() - 1">
              <button class="page-link shadow-brand-sm ms-2" (click)="onPageChange(currentPage() + 1)">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  `,
  styles: [`
    .fw-800 { font-weight: 800; }
    .fw-700 { font-weight: 700; }
    .fw-600 { font-weight: 600; }
    .extra-small { font-size: 0.7rem; }

    /* Table Styling */
    .table-custom { border-collapse: separate; border-spacing: 0 10px; margin-top: -10px; }
    .table-custom thead th {
       background: transparent; border: none; color: #64748b;
       text-transform: uppercase; font-size: 0.75rem; font-weight: 700;
       letter-spacing: 0.8px; padding: 1.5rem 1rem;
    }
    .table-custom tbody tr { background: white; transition: all 0.3s; }
    .table-custom tbody tr:hover { background: #f8fafc; transform: scale(1.002); }
    .table-custom tbody td {
       border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 1.2rem 1rem;
    }
    .table-custom tbody td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
    .table-custom tbody td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 16px; border-bottom-right-radius: 16px; }

    /* Status Badges */
    .status-badge {
       padding: 6px 12px; border-radius: 30px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
    }
    .status-pending { background: #fef9c3; color: #854d0e; }
    .status-processing { background: #dbeafe; color: #1e40af; }
    .status-shipped { background: #dcfce7; color: #166534; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }

    /* Price Tag */
    .price-tag {
       background: #f8fafc; color: #1e293b;
       padding: 8px 14px; border-radius: 10px; font-size: 0.9rem;
    }

    /* Action Buttons */
    .btn-icon-sm {
       width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
       border-radius: 10px; border: none; transition: all 0.2s;
    }
    .btn-view { background: #eff6ff; color: #2563eb; }
    .btn-delete { background: #fef2f2; color: #ef4444; }
    .btn-view:hover { background: #2563eb; color: white; }
    .btn-delete:hover { background: #ef4444; color: white; }

    .pagination-custom .page-link {
       width: 44px; height: 44px; border-radius: 12px !important;
       display: flex; align-items: center; justify-content: center;
       border: none; background: #f1f5f9; color: #1e293b; font-weight: bold;
    }
    .pagination-custom .page-link:hover { background: #e2e8f0; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  keyword = '';

  private ordersService = inject(OrdersService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.getOrders();
  }

  getOrders() {
    this.ordersService.getAllOrders(this.keyword, this.currentPage(), 10).subscribe({
      next: (response) => {
        this.orders.set(response.content);
        this.totalPages.set(response.totalPages);
      },
      error: (err) => {
        this.toastService.error("Không thể tải danh sách đơn hàng");
      }
    });
  }

  searchOrders() {
    this.currentPage.set(0);
    this.getOrders();
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.getOrders();
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-shipped';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  viewDetails(id: number) {
    // Navigate to order details if implemented
    this.toastService.info("Chức năng xem chi tiết đang phát triển");
  }

  deleteOrder(id: number) {
    if (confirm("Bạn có chắc chắn muốn xóa đơn hàng này? Thao tác này sẽ ẩn đơn hàng khỏi hệ thống.")) {
      this.ordersService.deleteOrder(id).subscribe({
        next: () => {
          this.toastService.success("Đã xóa đơn hàng thành công");
          this.getOrders();
        },
        error: (err) => {
          this.toastService.error("Lỗi khi xóa đơn hàng");
        }
      });
    }
  }
}
