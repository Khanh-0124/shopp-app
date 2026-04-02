import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { UserService } from '../../service/user.service';
import { ToastService } from '../../service/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Modern Confirm Modal -->
    @if (showModal) {
      <div class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
        <div class="modal-container-custom bg-white shadow-2xl rounded-5 p-5 text-center overflow-hidden position-relative" style="max-width: 450px;">
          <div class="mb-4">
            <div class="icon-shape bg-danger-soft text-danger mx-auto">
              <i class="fa-solid fa-triangle-exclamation fs-1"></i>
            </div>
          </div>
          <h3 class="fw-800 text-dark mb-3">Xác nhận thao tác</h3>
          <p class="text-muted mb-5 px-3">
            {{ isDeleteAll ? 'CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn TẤT CẢ sản phẩm. Bạn có chắc chắn không?' : 'Sản phẩm này sẽ bị xóa khỏi hệ thống. Thao tác này không thể hoàn tác.' }}
          </p>
          <div class="d-flex gap-3">
            <button class="btn btn-light-lg rounded-4 px-4 flex-grow-1 fw-bold py-3" (click)="closeModal()">Hủy bỏ</button>
            <button class="btn btn-danger-lg rounded-4 px-4 flex-grow-1 fw-bold shadow-danger py-3" (click)="confirmAction()">
              <i class="fa-solid fa-trash-can me-2"></i>Chấp nhận xóa
            </button>
          </div>
        </div>
      </div>
    }

    <div class="row mb-5 align-items-center">
      <div class="col-md-6 text-start">
        <h2 class="fw-800 text-dark mb-1">Kho Sản Phẩm</h2>
        <p class="text-muted small mb-0">Quản lý {{ products().length }} mặt hàng đang kinh doanh</p>
      </div>
      <div class="col-md-6 text-md-end mt-3 mt-md-0 d-flex gap-3 justify-content-md-end">
        <button class="btn btn-danger-soft-lg rounded-4 fw-bold px-4 py-3 border-0" (click)="deleteAll()">
          <i class="fa-solid fa-trash-can me-2"></i>Xóa sạch kho
        </button>
        <button class="btn btn-brand-lg rounded-4 fw-bold shadow-brand px-4 py-3" (click)="addProduct()">
          <i class="fa-solid fa-plus me-2"></i>Thêm Mới Sản Phẩm
        </button>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-5 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th scope="col" class="ps-4">Sản phẩm</th>
                <th scope="col">Hình ảnh</th>
                <th scope="col">Giá niêm yết</th>
                <th scope="col" class="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.id) {
              <tr>
                <td class="ps-4">
                  <div class="d-flex flex-column">
                    <span class="text-muted small fw-600 mb-1">#{{ product.id }}</span>
                    <span class="fw-800 text-dark fs-6">{{ product.name }}</span>
                  </div>
                </td>
                <td>
                  <div class="product-img-wrapper shadow-sm rounded-4 overflow-hidden border">
                    <img [src]="getImageUrl(product.thumbnail)" 
                         class="img-fluid object-fit-cover" 
                         alt="product"
                         (error)="$event.target.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?q=80&w=200&h=200&auto=format&fit=crop'">
                  </div>
                </td>
                <td>
                  <span class="price-tag fw-bold">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
                </td>
                <td class="text-end pe-4">
                  <div class="action-btns d-inline-flex gap-2">
                    <button class="btn btn-icon-sm btn-edit shadow-sm" (click)="$event.stopPropagation(); editProduct(product.id)" title="Chỉnh sửa">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-icon-sm btn-delete shadow-sm" (click)="$event.stopPropagation(); deleteProduct(product.id)" title="Xóa">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Premium Pagination -->
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
    .fw-600 { font-weight: 600; }

    /* Buttons */
    .btn-brand-lg {
       background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
       color: white; border: none;
       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-brand-lg:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3); color: white; }
    .shadow-brand { box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.3); }

    .btn-danger-lg {
       background: #ef4444; color: white; border: none;
       transition: all 0.2s;
    }
    .btn-danger-lg:hover { background: #dc2626; box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3); }
    
    .btn-danger-soft-lg {
       background: #fef2f2; color: #ef4444;
       transition: all 0.2s;
    }
    .btn-danger-soft-lg:hover { background: #fee2e2; color: #b91c1c; }

    .btn-light-lg { background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; }

    /* Table Styling */
    .table-custom { border-collapse: separate; border-spacing: 0 10px; margin-top: -10px; }
    .table-custom thead th {
       background: transparent; border: none; color: #64748b;
       text-transform: uppercase; font-size: 0.75rem; font-weight: 700;
       letter-spacing: 0.8px; padding: 1.8rem 1rem;
    }
    .table-custom tbody tr { background: white; transition: all 0.3s; }
    .table-custom tbody tr:hover { background: #f8fafc; transform: scale(1.005); }
    .table-custom tbody td {
       border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; padding: 1.5rem 1rem;
    }
    .table-custom tbody td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
    .table-custom tbody td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 16px; border-bottom-right-radius: 16px; }

    /* Product Image */
    .product-img-wrapper { width: 64px; height: 64px; }
    .product-img-wrapper img { width: 100%; height: 100%; transition: transform 0.3s; }
    .table-custom tbody tr:hover .product-img-wrapper img { transform: scale(1.1); }

    /* Price Tag */
    .price-tag {
       background: #f0fdf4; color: #16a34a;
       padding: 8px 14px; border-radius: 10px; font-size: 0.9rem;
    }

    /* Action Buttons */
    .btn-icon-sm {
       width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
       border-radius: 12px; border: none; transition: all 0.2s;
    }
    .btn-edit { background: #eff6ff; color: #2563eb; }
    .btn-delete { background: #fef2f2; color: #ef4444; }
    .btn-edit:hover { background: #2563eb; color: white; }
    .btn-delete:hover { background: #ef4444; color: white; }

    /* Pagination */
    .pagination-custom .page-link {
       width: 44px; height: 44px; border-radius: 12px !important;
       display: flex; align-items: center; justify-content: center;
       border: none; background: #f1f5f9; color: #1e293b; font-weight: bold;
    }
    .pagination-custom .page-link:hover { background: #e2e8f0; }

    /* Modal Styling */
    .modal-backdrop-custom {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);
      z-index: 2000; animation: fadeIn 0.3s ease;
    }
    .modal-container-custom {
      width: 100%; max-width: 500px;
      animation: modalSlideUp 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    }
    .icon-shape {
       width: 80px; height: 80px; border-radius: 24px;
       display: flex; align-items: center; justify-content: center;
    }
    .bg-danger-soft { background: #fef2f2; }
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class AdminProductsComponent implements OnInit {
  products = signal<any[]>([]);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);
  isDeleting = false;
  
  // Modal state
  showModal = false;
  productIdToDelete: number | null = null;
  isDeleteAll = false;

  private productService = inject(ProductService);
  private userService = inject(UserService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.getProducts();
  }

  getProducts() {
    console.log(`[DEBUG] getProducts called for page: ${this.currentPage()}`);
    this.productService.getProducts('', 0, this.currentPage(), 10).subscribe({
      next: (response) => {
        console.log('[DEBUG] getProducts success:', response.products.length, 'items');
        this.products.set(response.products);
        this.totalPages.set(response.totalPages);
      },
      error: (err) => console.error('[DEBUG] getProducts error:', err)
    });
  }

  getImageUrl(thumbnail: string | null): string {
    if (!thumbnail || thumbnail === "") return 'https://via.placeholder.com/150x150?text=No+Image';
    if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) return thumbnail;
    return `${environment.apiBaseUrl}/products/images/${thumbnail}`;
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages()) {
      this.currentPage.set(page);
      this.getProducts();
    }
  }

  addProduct() {
    this.router.navigate(['/admin/products/add']);
  }

  editProduct(id: number) {
    this.router.navigate(['/admin/products/edit', id]);
  }

  deleteProduct(id: number) {
    console.log(`[DEBUG] deleteProduct triggered for ID: ${id}`);
    this.productIdToDelete = id;
    this.isDeleteAll = false;
    this.showModal = true;
  }

  deleteAll() {
    console.log('[DEBUG] deleteAll triggered');
    this.isDeleteAll = true;
    this.productIdToDelete = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.productIdToDelete = null;
    this.isDeleteAll = false;
  }

  confirmAction() {
    console.log('[DEBUG] confirmAction clicked in custom modal');
    this.showModal = false;
    const token = this.userService.getToken();
    if (!token) {
      this.toastService.warning("Vui lòng đăng nhập để thực hiện thao tác");
      return;
    }

    if (this.isDeleteAll) {
      this.productService.deleteAllProducts(token).subscribe({
        next: () => {
          this.toastService.success('Đã xóa toàn bộ sản phẩm');
          this.getProducts();
        },
        error: (err) => this.toastService.error('Lỗi: ' + (err.error || err.message))
      });
    } else if (this.productIdToDelete !== null) {
      this.isDeleting = true;
      this.productService.deleteProduct(this.productIdToDelete, token).subscribe({
        next: () => {
          this.isDeleting = false;
          this.toastService.success('Xóa sản phẩm thành công');
          this.getProducts();
        },
        error: (err) => {
          this.isDeleting = false;
          this.toastService.error('Lỗi: ' + (err.error || err.message));
        }
      });
    }
  }
}
