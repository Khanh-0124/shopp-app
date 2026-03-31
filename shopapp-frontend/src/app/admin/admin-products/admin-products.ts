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
    <!-- Custom Confirm Modal -->
    @if (showModal) {
      <div class="modal fade show" style="display: block; background: rgba(0,0,0,0.5); z-index: 9999;">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
            <div class="modal-body p-5 text-center">
              <div class="mb-4">
                <i class="fa-solid fa-circle-exclamation text-warning" style="font-size: 4rem;"></i>
              </div>
              <h4 class="fw-bold mb-3">Xác nhận thao tác</h4>
              <p class="text-secondary mb-4">
                {{ isDeleteAll ? 'CẢNH BÁO: Bạn có chắc chắn muốn xóa TẤT CẢ sản phẩm không? Hành động này không thể hoàn tác!' : 'Bạn có chắc chắn muốn xóa sản phẩm này không?' }}
              </p>
              <div class="d-flex gap-3 justify-content-center">
                <button class="btn btn-light rounded-pill px-4 py-2 fw-bold" (click)="closeModal()">Hủy bỏ</button>
                <button class="btn btn-danger rounded-pill px-4 py-2 fw-bold shadow-sm" (click)="confirmAction()">
                  <i class="fa-solid fa-trash-can me-2"></i>Chắc chắn xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    }

    <div class="container-fluid py-5 bg-light min-vh-100">
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden" style="background: white;">
      <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
        <h4 class="mb-0 fw-bold">Danh sách Sản phẩm</h4>
        <div class="d-flex gap-2">
          <button class="btn btn-danger rounded-pill fw-bold shadow-sm px-4" (click)="deleteAll()">
            <i class="fa-solid fa-trash-can me-2"></i>Xóa Tất Cả
          </button>
          <button class="btn btn-primary rounded-pill fw-bold shadow-sm px-4" (click)="addProduct()">
            <i class="fa-solid fa-plus me-2"></i>Thêm Mới
          </button>
        </div>
      </div>
      
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th scope="col" class="ps-4 py-3 text-secondary text-uppercase small fw-bold">ID</th>
                <th scope="col" class="py-3 text-secondary text-uppercase small fw-bold">Hình ảnh</th>
                <th scope="col" class="py-3 text-secondary text-uppercase small fw-bold" style="width: 30%;">Tên Sản Phẩm</th>
                <th scope="col" class="py-3 text-secondary text-uppercase small fw-bold">Giá bán</th>
                <th scope="col" class="py-3 text-secondary text-uppercase small fw-bold text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @for (product of products(); track product.id) {
              <tr style="transition: all 0.2s ease;">
                <td class="ps-4 fw-medium text-muted">#{{ product.id }}</td>
                <td>
                  <img [src]="getImageUrl(product.thumbnail)" 
                       class="rounded-3 shadow-sm object-fit-cover" 
                       style="width: 60px; height: 60px;" alt="product"
                       (error)="$event.target.src='https://via.placeholder.com/150x150?text=Invalid+Link'">
                </td>
                <td class="fw-bold text-dark">{{ product.name }}</td>
                <td class="fw-bold text-primary">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</td>
                <td class="text-end pe-4">
                  <div class="btn-group shadow-sm rounded-pill">
                    <button class="btn btn-light text-primary py-2 px-3 border-secondary border-opacity-25" (click)="$event.stopPropagation(); editProduct(product.id)" title="Chỉnh sửa">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-light text-danger py-2 px-3 border-secondary border-opacity-25" (click)="$event.stopPropagation(); deleteProduct(product.id)" title="Xóa">
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
      
      <!-- Pagination -->
      <div class="card-footer bg-white border-top p-4 d-flex justify-content-between align-items-center">
        <span class="text-muted small">Hiển thị trang {{ currentPage() + 1 }} / {{ totalPages() }}</span>
        <nav aria-label="Page navigation">
          <ul class="pagination pagination-sm mb-0 gap-1">
            <li class="page-item" [class.disabled]="currentPage() === 0">
              <button class="page-link rounded-circle border-0 shadow-sm text-dark bg-light p-2" (click)="onPageChange(currentPage() - 1)">
                <i class="fa-solid fa-chevron-left" style="width: 16px;"></i>
              </button>
            </li>
            <li class="page-item" [class.disabled]="currentPage() >= totalPages() - 1">
              <button class="page-link rounded-circle border-0 shadow-sm text-dark bg-light p-2" (click)="onPageChange(currentPage() + 1)">
                <i class="fa-solid fa-chevron-right" style="width: 16px;"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
    </div>
  `,
  styles: [`
    tr:hover {
      background-color: #f8f9fa !important;
      position: relative;
    }
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
