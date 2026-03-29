import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { UserService } from '../../service/user.service';
import { CategoryService } from '../../service/category.service';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden" style="background: white;">
      <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
        <h4 class="mb-0 fw-bold">{{ isEditMode() ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới' }}</h4>
        <button class="btn btn-outline-secondary rounded-pill fw-bold shadow-sm px-4" (click)="goBack()">
          <i class="fa-solid fa-arrow-left me-2"></i>Quay lại
        </button>
      </div>

      <div class="card-body p-5">
        <form #productForm="ngForm" (ngSubmit)="saveProduct(productForm)" class="row g-4 px-lg-3">
          <div class="col-md-6">
            <label class="form-label fw-bold text-muted small text-uppercase">Tên sản phẩm *</label>
            <input type="text" class="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4 py-3"
                   [(ngModel)]="productData.name" name="name" required minlength="3" #name="ngModel"
                   [class.is-invalid]="name.invalid && name.touched"
                   placeholder="Nhập tên sản phẩm...">
            <div class="invalid-feedback" *ngIf="name.invalid && name.touched">Tên sản phẩm phải từ 3 ký tự trở lên.</div>
          </div>
          
          <div class="col-md-6">
            <label class="form-label fw-bold text-muted small text-uppercase">Giá bán (VND) *</label>
            <div class="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
              <span class="input-group-text bg-light border-0 px-4 fw-bold">₫</span>
              <input type="number" class="form-control bg-light border-0 px-4 py-3"
                     [(ngModel)]="productData.price" name="price" required min="1000" #price="ngModel"
                     [class.is-invalid]="price.invalid && price.touched"
                     placeholder="0">
            </div>
            <div class="text-danger small mt-1" *ngIf="price.invalid && price.touched">Giá tối thiểu là 1.000đ.</div>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold text-muted small text-uppercase">Danh mục sản phẩm *</label>
            <select class="form-select form-select-lg bg-light border-0 shadow-sm rounded-3 px-4 py-3"
                    [(ngModel)]="productData.category_id" name="categoryId" required #category="ngModel"
                    [class.is-invalid]="category.invalid && category.touched">
              <option value="" disabled>Chọn danh mục...</option>
              @for (category of categories(); track category.id) {
                <option [value]="category.id">{{ category.name }}</option>
              }
            </select>
            <div class="invalid-feedback" *ngIf="category.invalid && category.touched">Vui lòng chọn danh mục.</div>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold text-muted small text-uppercase">Hình ảnh từ máy tính</label>
            <input type="file" class="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4 py-3"
                   (change)="onFileChange($event)" multiple accept="image/*">
            <div class="form-text mt-2 text-primary small"><i class="fa-solid fa-cloud-arrow-up me-1"></i>Tải nhiều ảnh từ máy tính (nếu có).</div>
          </div>

          <!-- Existing Images Section -->
          @if (isEditMode() && existingImages.length > 0) {
            <div class="col-12 mt-4">
              <label class="form-label fw-bold text-muted small text-uppercase mb-3">Thứ tự ảnh (Kéo để sắp xếp - Click sao để làm ảnh đại diện)</label>
              <div class="d-flex flex-wrap gap-4">
                @for (img of existingImages; track img.id) {
                  <div class="position-relative group shadow rounded-3 overflow-hidden border-2" 
                       [class.border-primary]="productData.thumbnail === img.image_url"
                       [class.border-transparent]="productData.thumbnail !== img.image_url"
                       draggable="true"
                       (dragstart)="onDragStart($index)"
                       (dragover)="onDragOver($event)"
                       (drop)="onDrop($event, $index)"
                       style="width: 120px; height: 120px; transition: all 0.3s ease; cursor: move;">
                    
                    <img [src]="getImageUrl(img.image_url)" class="w-100 h-100 object-fit-cover"
                         [style.opacity]="productData.thumbnail === img.image_url ? '1' : '0.8'">
                    
                    <!-- Delete Button -->
                    <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle shadow-sm" 
                            style="width: 24px; height: 24px; padding: 0; z-index: 10;"
                            (click)="deleteExistingImage(img.id)">
                      <i class="fa-solid fa-xmark" style="font-size: 10px;"></i>
                    </button>

                    <!-- Set as Thumbnail Button -->
                    <button type="button" class="btn btn-sm position-absolute bottom-0 start-0 w-100 border-0 rounded-0 py-1 fw-bold text-white shadow-sm"
                            [style.background]="productData.thumbnail === img.image_url ? '#6366f1' : 'rgba(0,0,0,0.5)'"
                            style="font-size: 10px; z-index: 5;"
                            (click)="setPrimaryImage(img.image_url)">
                      <i class="fa-solid fa-star me-1" [class.text-warning]="productData.thumbnail === img.image_url"></i>
                      {{ productData.thumbnail === img.image_url ? 'ĐẠI DIỆN' : 'CHỌN LÀM CHÍNH' }}
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <div class="col-12 mt-4">
            <label class="form-label fw-bold text-muted small text-uppercase">Link hình ảnh từ Internet</label>
            @for (link of imageLinks; track $index) {
              <div class="d-flex gap-2 mb-2">
                <input type="text" class="form-control bg-light border-0 shadow-sm rounded-3 px-4 py-2"
                       [(ngModel)]="imageLinks[$index]" [name]="'imageLink' + $index" placeholder="Dán link ảnh vào đây (vd: https://...)">
                <button type="button" class="btn btn-outline-danger border-0" (click)="removeImageLink($index)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            }
            <button type="button" class="btn btn-outline-primary btn-sm rounded-pill px-3 mt-1" (click)="addImageLink()">
              <i class="fa-solid fa-plus me-1"></i>Thêm Link Ảnh
            </button>
          </div>

          <div class="col-12">
            <label class="form-label fw-bold text-muted small text-uppercase">Mô tả sản phẩm</label>
            <textarea class="form-control bg-light border-0 shadow-sm rounded-3 p-4" rows="4"
                      [(ngModel)]="productData.description" name="description" placeholder="Vài nét về sản phẩm..."></textarea>
          </div>

          <div class="col-12 text-end mt-5 pt-4 border-top">
            <button type="submit" class="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-lg"
                    [disabled]="productForm.invalid"
                    style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border: none;">
              <i class="fa-solid fa-floppy-disk me-2"></i> {{ isEditMode() ? 'Cập Nhật' : 'Lưu Sản Phẩm' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AdminProductFormComponent implements OnInit {
  isEditMode = signal<boolean>(false);
  productId = signal<number>(0);
  
  productData: any = {
    name: '',
    price: 0,
    thumbnail: '',
    description: '',
    category_id: '',
    image_urls: []
  };

  selectedFiles: File[] = [];
  imageLinks: string[] = ['']; // Khởi tạo 1 ô nhập link trống
  categories = signal<any[]>([]);
  existingImages: any[] = []; // Chứa danh sách ảnh cũ từ server

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private userService = inject(UserService);
  private categoryService = inject(CategoryService);

  ngOnInit() {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(Number(id));
      this.loadProduct(Number(id));
    }
  }

  addImageLink() {
    this.imageLinks.push('');
  }

  removeImageLink(index: number) {
    this.imageLinks.splice(index, 1);
    if (this.imageLinks.length === 0) this.imageLinks.push('');
  }

  setPrimaryImage(url: string) {
    this.productData.thumbnail = url;
    console.log('Đã chọn ảnh đại diện mới:', url);
  }

  // --- Hệ thống Kéo Thả (Drag & Drop) thủ công ---
  draggedIndex: number | null = null;

  onDragStart(index: number) {
    this.draggedIndex = index;
  }

  onDragOver(event: Event) {
    event.preventDefault(); // Cho phép thả
  }

  onDrop(event: Event, targetIndex: number) {
    event.preventDefault();
    if (this.draggedIndex === null || this.draggedIndex === targetIndex) return;

    // Di chuyển item trong mảng existingImages
    const movedItem = this.existingImages.splice(this.draggedIndex, 1)[0];
    this.existingImages.splice(targetIndex, 0, movedItem);

    this.draggedIndex = null;
    console.log('Đã thay đổi thứ tự ảnh');
  }
  // ----------------------------------------------

  deleteExistingImage(imageId: number) {
    if (confirm('Bạn có chắc chắn muốn xóa ảnh này không?')) {
      const token = this.userService.getToken();
      if (!token) return;
      
      // Xử lý Optimistic UI: Xóa khỏi màn hình ngay lập tức
      const originalImages = [...this.existingImages];
      const deletedImg = this.existingImages.find(img => img.id === imageId);
      this.existingImages = this.existingImages.filter(img => img.id !== imageId);
      
      // Nếu ảnh vừa xóa là thumbnail, xóa luôn thumbnail trong productData để Backend tự set lại cái khác
      if (deletedImg && deletedImg.image_url === this.productData.thumbnail) {
        this.productData.thumbnail = '';
      }

      this.productService.deleteProductImage(imageId, token).subscribe({
        next: () => {
          console.log('Xóa ảnh thành công từ Server');
        },
        error: (err) => {
          // Nếu lỗi thì rollback (hiện lại ảnh)
          this.existingImages = originalImages;
          if (deletedImg && deletedImg.image_url === '') {
             this.productData.thumbnail = deletedImg.image_url;
          }
          alert('Lỗi khi xóa ảnh trên Server: ' + (err.error || err.message));
        }
      });
    }
  }

  getImageUrl(thumbnail: string | null): string {
    if (!thumbnail || thumbnail === "") return 'https://via.placeholder.com/150x150?text=No+Image';
    if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) return thumbnail;
    return `http://localhost:8088/api/v1/products/images/${thumbnail}`;
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories.set(res),
      error: (err) => alert('Lỗi tải danh mục: ' + err.message)
    });
  }

  onFileChange(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.productData = {
          name: res.name,
          price: res.price,
          thumbnail: res.thumbnail,
          description: res.description,
          category_id: res.category_id,
          image_urls: []
        };
        this.existingImages = res.product_images || [];
      },
      error: (err) => alert('Lỗi tải sản phẩm: ' + err.message)
    });
  }

  saveProduct(form: any) {
    if (form.invalid) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }

    const token = this.userService.getToken();
    if (!token) {
      alert('Chưa đăng nhập!');
      return;
    }

    // Lọc bỏ các Link rỗng
    this.productData.image_urls = this.imageLinks.filter(link => link.trim() !== '');

    // FIX: Tự động gán ảnh đại diện nếu nó đang trống
    if (!this.productData.thumbnail || this.productData.thumbnail === '') {
      if (this.productData.image_urls.length > 0) {
        this.productData.thumbnail = this.productData.image_urls[0];
      } else if (this.existingImages.length > 0) {
        this.productData.thumbnail = this.existingImages[0].image_url;
      }
    }

    // Validate ít nhất phải có 1 cái ảnh (ảnh cũ hoặc ảnh mới upload hoặc link)
    if (this.existingImages.length === 0 && this.selectedFiles.length === 0 && this.productData.image_urls.length === 0) {
      alert('Sản phẩm phải có ít nhất 1 hình ảnh!');
      return;
    }

    if (this.isEditMode()) {
      this.productService.updateProduct(this.productId(), this.productData, token).subscribe({
        next: (res) => {
          this.uploadImages(this.productId(), token);
        },
        error: (err) => alert('Lỗi cập nhật: ' + (err.error || err.message))
      });
    } else {
      this.productService.createProduct(this.productData, token).subscribe({
        next: (res) => {
          this.uploadImages(res.id, token);
        },
        error: (err) => alert('Lỗi khi tạo: ' + (err.error || err.message))
      });
    }
  }

  uploadImages(productId: number, token: string) {
    if (this.selectedFiles.length > 0) {
      this.productService.uploadImages(productId, this.selectedFiles, token).subscribe({
        next: () => {
          alert('Lưu sản phẩm và ảnh thành công!');
          this.goBack();
        },
        error: (err) => {
          alert('Sản phẩm đã lưu nhưng upload ảnh lỗi: ' + (err.error || err.message));
          this.goBack();
        }
      });
    } else {
      alert('Lưu sản phẩm thành công!');
      this.goBack();
    }
  }

  goBack() {
    this.router.navigate(['/admin/products']);
  }
}
