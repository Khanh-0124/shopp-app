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
        <h4 class="mb-0 fw-bold text-dark"><i class="fa-solid fa-box-open me-2 text-primary"></i>{{ isEditMode() ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới' }}</h4>
        <button class="btn btn-outline-secondary rounded-pill fw-bold shadow-sm px-4" (click)="goBack()">
          <i class="fa-solid fa-arrow-left me-2"></i>Quay lại
        </button>
      </div>

      <div class="card-body p-5">
        <form #productForm="ngForm" (ngSubmit)="saveProduct(productForm)" class="row g-4 px-lg-3">
          <!-- Thông tin cơ bản -->
          <div class="col-md-6">
            <label class="form-label fw-bold text-muted small text-uppercase">Tên sản phẩm *</label>
            <input type="text" class="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4 py-3"
                   [(ngModel)]="productData.name" name="name" required minlength="3" #name="ngModel"
                   [class.is-invalid]="name.invalid && name.touched"
                   placeholder="Nhập tên sản phẩm...">
            <div class="invalid-feedback" *ngIf="name.invalid && name.touched">Tên sản phẩm phải từ 3 ký tự trở lên.</div>
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

          <!-- Phân loại sản phẩm (Kiểu Shopee) -->
          <div class="col-12 mt-5">
            <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h5 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-layer-group me-2 text-primary"></i>Phân loại sản phẩm</h5>
                <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" 
                        *ngIf="attributeGroups.length < 2" (click)="addAttributeGroup()">
                    <i class="fa-solid fa-plus me-1"></i>Thêm nhóm phân loại
                </button>
            </div>

            <!-- Các nhóm phân loại -->
            <div class="bg-light p-4 rounded-4 mb-4" *ngFor="let group of attributeGroups; let i = index">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="flex-grow-1 me-3">
                        <label class="form-label fw-bold text-muted small text-uppercase">Tên nhóm phân loại {{i + 1}}</label>
                        <input type="text" class="form-control border-0 shadow-sm rounded-3" 
                               [(ngModel)]="group.name" [name]="'groupName' + i" 
                               placeholder="VD: Màu sắc, Kích thước..." (input)="generateVariants()">
                    </div>
                    <button type="button" class="btn btn-outline-danger btn-sm rounded-circle mt-4" (click)="removeAttributeGroup(i)">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                
                <label class="form-label fw-bold text-muted small text-uppercase">Giá trị phân loại</label>
                <div class="bg-white p-3 rounded-4 shadow-sm border border-light-subtle">
                    <div class="d-flex flex-wrap gap-2 mb-3">
                        <span class="badge bg-primary d-flex align-items-center gap-2 py-2 px-3 rounded-pill shadow-sm" 
                              *ngFor="let val of group.values; let j = index" style="font-size: 0.9rem;">
                            {{ val }}
                            <i class="fa-solid fa-xmark cursor-pointer opacity-75 hover-opacity-100" (click)="removeAttributeValue(i, j)"></i>
                        </span>
                        <div class="text-muted small w-100 mt-1" *ngIf="group.values.length === 0">
                            <i class="fa-solid fa-info-circle me-1"></i>Chưa có giá trị nào. Hãy nhập ở dưới.
                        </div>
                    </div>
                    
                    <div class="input-group shadow-sm rounded-3 overflow-hidden" style="max-width: 450px;">
                        <input type="text" class="form-control border-0 bg-light px-3" #valInput 
                               placeholder="VD: Đen, Trắng, XL, L..." 
                               (keyup.enter)="addAttributeValue(i, valInput)">
                        <button class="btn btn-primary px-4 fw-bold border-0" type="button" 
                                (click)="addAttributeValue(i, valInput)"
                                style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
                            <i class="fa-solid fa-plus me-1"></i>Thêm
                        </button>
                    </div>
                </div>
            </div>

            <!-- Bảng danh sách phân loại -->
            <div class="mt-4 overflow-hidden border rounded-4 shadow-sm" *ngIf="productVariants.length > 0">
                <div class="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                    <span class="fw-bold">Danh sách tất cả các biến thể</span>
                    <div class="d-flex gap-2">
                        <div class="input-group input-group-sm rounded-pill overflow-hidden" style="width: 250px;">
                            <span class="input-group-text bg-white border-0 text-dark fw-bold">Giá chung</span>
                            <input type="number" class="form-control border-0" placeholder="000.000" #bulkPrice>
                            <button class="btn btn-warning border-0 fw-bold" type="button" (click)="updateAllPrices(bulkPrice.value)">Áp dụng</button>
                        </div>
                        <div class="input-group input-group-sm rounded-pill overflow-hidden" style="width: 250px;">
                            <span class="input-group-text bg-white border-0 text-dark fw-bold">Kho chung</span>
                            <input type="number" class="form-control border-0" placeholder="0" #bulkStock>
                            <button class="btn btn-warning border-0 fw-bold" type="button" (click)="updateAllStocks(bulkStock.value)">Áp dụng</button>
                        </div>
                    </div>
                </div>
                  <tbody>
                    <tr *ngFor="let variant of productVariants; let v = index">
                      <td class="fw-bold text-primary px-4" *ngFor="let comboVal of variant.combination">{{ comboVal }}</td>
                      <td class="px-4">
                        <input type="number" class="form-control form-control-sm border-0 bg-light text-center fw-bold" 
                               [(ngModel)]="variant.price" [name]="'variantPrice' + v" placeholder="0" (input)="updateMinPriceFromVariants()">
                      </td>
                      <td class="px-4">
                        <input type="number" class="form-control form-control-sm border-0 bg-light text-center" 
                               [(ngModel)]="variant.stock" [name]="'variantStock' + v" placeholder="0">
                      </td>
                      <td class="px-3">
                        <input type="text" class="form-control form-control-sm border-0 bg-light text-center text-muted small" 
                               [(ngModel)]="variant.sku" [name]="'variantSku' + v" placeholder="Mã SKU">
                      </td>
                    </tr>
                  </tbody>
                </table>
            </div>

            <!-- Giá mặc định (Hiện khi KHÔNG CÓ phân loại HOẶC để hiển thị giá thấp nhất) -->
            <div class="col-md-12 mt-4">
                <div class="alert alert-info border-0 rounded-4 p-4 d-flex align-items-center mb-0" *ngIf="productVariants.length === 0">
                    <i class="fa-solid fa-circle-info fs-3 me-3"></i>
                    <div>
                        <div class="fw-bold fs-5 mb-1">Mẹo: Thêm phân loại để khách hàng dễ chọn lựa!</div>
                        <p class="mb-0 opacity-75">Sản phẩm của bạn chưa có phân loại. Hãy nhập giá bán cơ bản bên dưới.</p>
                    </div>
                </div>
                <div class="alert alert-success border-0 rounded-4 p-3 d-flex align-items-center mb-0" *ngIf="productVariants.length > 0">
                    <i class="fa-solid fa-check-circle fs-4 me-3"></i>
                    <div>
                        <span class="fw-bold">Giá hiển thị:</span> Hệ thống sẽ tự động lấy giá thấp nhất từ các phân loại bên trên ({{ productData.price | number:'1.0-2' }} ₫).
                    </div>
                </div>

                <div class="mt-4 col-md-6 mx-auto">
                    <label class="form-label fw-bold text-muted small text-uppercase">
                        {{ productVariants.length > 0 ? 'Giá hiển thị thấp nhất (Tự động)' : 'Giá bán mặc định (VND) *' }}
                    </label>
                    <div class="input-group input-group-lg shadow-sm rounded-3 overflow-hidden">
                        <span class="input-group-text bg-light border-0 px-4 fw-bold">₫</span>
                        <input type="number" class="form-control bg-light border-0 px-4 py-3"
                            [(ngModel)]="productData.price" name="price" 
                            [required]="productVariants.length === 0" 
                            [readonly]="productVariants.length > 0"
                            min="0" #price="ngModel"
                            [class.is-invalid]="price.invalid && price.touched"
                            placeholder="0">
                    </div>
                </div>
            </div>
          </div>

          <div class="col-12 mt-5">
            <h5 class="fw-bold mb-3 border-bottom pb-2 text-dark"><i class="fa-solid fa-images me-2 text-primary"></i>Hình ảnh sản phẩm</h5>
            <div class="row g-4">
                <div class="col-md-6">
                    <label class="form-label fw-bold text-muted small text-uppercase">Tải từ máy tính</label>
                    <input type="file" class="form-control form-control-lg bg-light border-0 shadow-sm rounded-3 px-4 py-3"
                        (change)="onFileChange($event)" multiple accept="image/*">
                    <div class="form-text mt-2 text-primary small"><i class="fa-solid fa-cloud-arrow-up me-1"></i>Kéo nhiều ảnh vào đây hoặc chọn file.</div>
                </div>
                <div class="col-md-6">
                    <label class="form-label fw-bold text-muted small text-uppercase">Thêm Link ảnh từ Internet</label>
                    @for (link of imageLinks; track $index) {
                    <div class="d-flex gap-2 mb-2">
                        <input type="text" class="form-control bg-light border-0 shadow-sm rounded-3 px-4 py-2"
                            [(ngModel)]="imageLinks[$index]" [name]="'imageLink' + $index" placeholder="Dán link ảnh (vd: https://...)">
                        <button type="button" class="btn btn-outline-danger border-0" (click)="removeImageLink($index)" *ngIf="imageLinks.length > 1">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                    }
                    <button type="button" class="btn btn-link btn-sm text-decoration-none p-0" (click)="addImageLink()">
                        <i class="fa-solid fa-plus me-1"></i>Thêm Link Ảnh khác
                    </button>
                </div>
            </div>
          </div>

          <!-- Existing Images Section -->
          @if (isEditMode() && existingImages.length > 0) {
            <div class="col-12 mt-4">
              <label class="form-label fw-bold text-muted small text-uppercase mb-3">Thứ tự ảnh (Click sao để làm ảnh đại diện)</label>
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
                    
                    <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle shadow-sm" 
                            style="width: 24px; height: 24px; padding: 0; z-index: 10;"
                            (click)="deleteExistingImage(img.id)">
                      <i class="fa-solid fa-xmark" style="font-size: 10px;"></i>
                    </button>

                    <button type="button" class="btn btn-sm position-absolute bottom-0 start-0 w-100 border-0 rounded-0 py-1 fw-bold text-white shadow-sm"
                            [style.background]="productData.thumbnail === img.image_url ? '#6366f1' : 'rgba(0,0,0,0.5)'"
                            style="font-size: 10px; z-index: 5;"
                            (click)="setPrimaryImage(img.image_url)">
                      <i class="fa-solid fa-star me-1" [class.text-warning]="productData.thumbnail === img.image_url"></i>
                      {{ productData.thumbnail === img.image_url ? 'ẢNH CHÍNH' : 'CHỌN CHÍNH' }}
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <div class="col-12 mt-5">
            <h5 class="fw-bold mb-3 text-dark"><i class="fa-solid fa-file-lines me-2 text-primary"></i>Mô tả chi tiết</h5>
            <textarea class="form-control bg-light border-0 shadow-sm rounded-4 p-4" rows="6"
                      [(ngModel)]="productData.description" name="description" placeholder="Viết mô tả chi tiết sản phẩm của bạn..."></textarea>
          </div>

          <div class="col-12 text-end mt-5 pt-4 border-top">
            <button type="submit" class="btn btn-primary btn-lg rounded-pill px-5 fw-bold shadow-lg"
                    [disabled]="productForm.invalid"
                    style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border: none; min-width: 250px;">
              <i class="fa-solid fa-floppy-disk me-2"></i> {{ isEditMode() ? 'Cập Nhật Sản Phẩm' : 'Lưu Sản Phẩm' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .badge-input-wrapper:focus-within {
        ring: 2px solid #6366f1;
    }
    input:focus {
        outline: none !important;
    }
    .cursor-pointer {
        cursor: pointer;
    }
  `]
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
    image_urls: [],
    has_variants: false
  };

  // Shopee-style classification state
  attributeGroups: any[] = [];
  productVariants: any[] = [];

  selectedFiles: File[] = [];
  imageLinks: string[] = ['']; 
  categories = signal<any[]>([]);
  existingImages: any[] = []; 

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

  // --- Classification Methods ---
  addAttributeGroup() {
    if (this.attributeGroups.length < 2) {
      this.attributeGroups.push({ name: '', values: [] });
    }
  }

  removeAttributeGroup(index: number) {
    this.attributeGroups.splice(index, 1);
    this.generateVariants();
  }

  addAttributeValue(groupIndex: number, input: any) {
    const value = input.value.trim();
    if (value && !this.attributeGroups[groupIndex].values.includes(value)) {
      this.attributeGroups[groupIndex].values.push(value);
      input.value = '';
      this.generateVariants();
    }
  }

  removeAttributeValue(groupIndex: number, valIndex: number) {
    this.attributeGroups[groupIndex].values.splice(valIndex, 1);
    this.generateVariants();
  }

  generateVariants() {
    if (this.attributeGroups.length === 0 || this.attributeGroups.every(g => g.values.length === 0)) {
      this.productVariants = [];
      return;
    }

    const combinations = this.cartesianProduct(
      this.attributeGroups.filter(g => g.values.length > 0).map(g => g.values)
    );

    // Keep existing data if possible
    const oldVariants = [...this.productVariants];
    
    this.productVariants = combinations.map(combo => {
      const existing = oldVariants.find(v => JSON.stringify(v.combination) === JSON.stringify(combo));
      return {
        combination: combo,
        price: existing ? existing.price : this.productData.price,
        stock: existing ? existing.stock : 0,
        sku: existing ? existing.sku : ''
      };
    });
    this.updateMinPriceFromVariants();
  }

  updateMinPriceFromVariants() {
    if (this.productVariants.length > 0) {
      const prices = this.productVariants
        .map(v => Number(v.price))
        .filter(p => !isNaN(p) && p > 0);
      
      if (prices.length > 0) {
        this.productData.price = Math.min(...prices);
      }
    }
  }

  private cartesianProduct(arrays: any[][]): any[][] {
    return arrays.reduce((acc, curr) => {
      return acc.flatMap(a => curr.map(b => [...a, b]));
    }, [[]] as any[][]);
  }

  updateAllPrices(price: any) {
    const p = Number(price);
    if (!isNaN(p)) {
      this.productVariants.forEach(v => v.price = p);
      this.updateMinPriceFromVariants();
    }
  }

  updateAllStocks(stock: any) {
    const s = Number(stock);
    if (!isNaN(s)) {
      this.productVariants.forEach(v => v.stock = s);
    }
  }
  // -----------------------------

  addImageLink() {
    this.imageLinks.push('');
  }

  removeImageLink(index: number) {
    this.imageLinks.splice(index, 1);
    if (this.imageLinks.length === 0) this.imageLinks.push('');
  }

  setPrimaryImage(url: string) {
    this.productData.thumbnail = url;
  }

  draggedIndex: number | null = null;
  onDragStart(index: number) { this.draggedIndex = index; }
  onDragOver(event: Event) { event.preventDefault(); }
  onDrop(event: Event, targetIndex: number) {
    event.preventDefault();
    if (this.draggedIndex === null || this.draggedIndex === targetIndex) return;
    const movedItem = this.existingImages.splice(this.draggedIndex, 1)[0];
    this.existingImages.splice(targetIndex, 0, movedItem);
    this.draggedIndex = null;
  }

  deleteExistingImage(imageId: number) {
    if (confirm('Bạn có chắc chắn muốn xóa ảnh này không?')) {
      const token = this.userService.getToken();
      if (!token) return;
      const originalImages = [...this.existingImages];
      const deletedImg = this.existingImages.find(img => img.id === imageId);
      this.existingImages = this.existingImages.filter(img => img.id !== imageId);
      if (deletedImg && deletedImg.image_url === this.productData.thumbnail) {
        this.productData.thumbnail = '';
      }
      this.productService.deleteProductImage(imageId, token).subscribe({
        next: () => console.log('Xóa ảnh thành công'),
        error: (err) => {
          this.existingImages = originalImages;
          alert('Lỗi: ' + (err.error || err.message));
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
          image_urls: [],
          has_variants: res.has_variants || false
        };
        this.existingImages = res.product_images || [];
        // Support loading variants if they exist (pending Backend update)
        if (res.attributes) this.attributeGroups = res.attributes;
        if (res.variants) this.productVariants = res.variants;
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
    if (!token) return;

    this.productData.image_urls = this.imageLinks.filter(link => link.trim() !== '');
    
    // Prepare data for backend
    const payload = {
        ...this.productData,
        has_variants: this.productVariants.length > 0,
        attribute_groups: this.attributeGroups,
        variants: this.productVariants
    };

    if (this.isEditMode()) {
      this.productService.updateProduct(this.productId(), payload, token).subscribe({
        next: (res) => this.uploadImages(this.productId(), token),
        error: (err) => alert('Lỗi cập nhật: ' + (err.error || err.message))
      });
    } else {
      this.productService.createProduct(payload, token).subscribe({
        next: (res) => this.uploadImages(res.id, token),
        error: (err) => alert('Lỗi khi tạo: ' + (err.error || err.message))
      });
    }
  }

  uploadImages(productId: number, token: string) {
    if (this.selectedFiles.length > 0) {
      this.productService.uploadImages(productId, this.selectedFiles, token).subscribe({
        next: () => {
          alert('Lưu sản phẩm thành công!');
          this.goBack();
        },
        error: (err) => {
          alert('Upload ảnh lỗi: ' + (err.error || err.message));
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
