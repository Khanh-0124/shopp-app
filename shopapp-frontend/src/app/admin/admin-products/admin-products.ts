import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { UserService } from '../../service/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
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
                    <button class="btn btn-light text-primary py-2 px-3 border-secondary border-opacity-25" (click)="editProduct(product.id)" title="Chỉnh sửa">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-light text-danger py-2 px-3 border-secondary border-opacity-25" (click)="deleteProduct(product.id)" title="Xóa">
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
  `,
  styles: [`
    tr:hover {
      background-color: #f3f4f6 !important;
      transform: scale(1.01);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 10;
      position: relative;
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products = signal<any[]>([]);
  totalPages = signal<number>(0);
  currentPage = signal<number>(0);

  private productService = inject(ProductService);
  private userService = inject(UserService);
  private router = inject(Router);

  ngOnInit() {
    this.getProducts();
  }

  getProducts() {
    this.productService.getProducts('', 0, this.currentPage(), 10).subscribe({
      next: (response) => {
        this.products.set(response.products);
        this.totalPages.set(response.totalPages);
      },
      error: (err) => console.error(err)
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
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) {
      const token = this.userService.getToken();
      if (token) {
         this.productService.deleteProduct(id, token).subscribe({
           next: () => {
             alert('Xóa thành công!');
             this.getProducts();
           },
           error: (err) => alert('Lỗi: ' + (err.error || err.message))
         });
      } else {
         alert("Yêu cầu đăng nhập");
      }
    }
  }

  deleteAll() {
    if (confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa TẤT CẢ sản phẩm không? Hành động này không thể hoàn tác!')) {
      const token = this.userService.getToken();
      if (token) {
        this.productService.deleteAllProducts(token).subscribe({
          next: () => {
            alert('Đã xóa tất cả sản phẩm thành công!');
            this.getProducts();
          },
          error: (err) => alert('Lỗi: ' + (err.error || err.message))
        });
      }
    }
  }
}
