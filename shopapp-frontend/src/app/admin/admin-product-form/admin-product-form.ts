import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../service/product.service';
import { UserService } from '../../service/user.service';
import { CategoryService } from '../../service/category.service';
import { ToastService } from '../../service/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="row mb-4 align-items-center">
      <div class="col-md-6">
        <h2 class="fw-800 text-dark mb-1">{{ isEditMode() ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới' }}</h2>
        <p class="text-muted small mb-0">Cập nhật thông tin chi tiết và biến thể cho mặt hàng</p>
      </div>
      <div class="col-md-6 text-md-end mt-3 mt-md-0">
        <button class="btn btn-light-lg rounded-4 fw-bold px-4 py-3" (click)="goBack()">
          <i class="fa-solid fa-arrow-left me-2"></i>Quay lại danh sách
        </button>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-5 overflow-hidden mb-5">
      <div class="card-body p-4 p-lg-5">
        <form #productForm="ngForm" (ngSubmit)="saveProduct(productForm)" class="row g-4">
          
          <!-- SECTION: BASIC INFO -->
          <div class="col-12 mb-2">
             <h5 class="section-title"><i class="fa-solid fa-circle-info me-2"></i>Thông tin cơ bản</h5>
          </div>

          <div class="col-md-8">
            <label class="form-label-custom">Tên sản phẩm <span class="text-danger">*</span></label>
            <div class="input-group-custom">
               <i class="fa-solid fa-tag text-muted"></i>
               <input type="text" class="form-control-custom"
                    [(ngModel)]="productData.name" name="name" required minlength="3" #name="ngModel"
                    [class.is-invalid]="name.invalid && name.touched"
                    placeholder="Nhập tên sản phẩm (vd: iPhone 15 Pro Max)">
            </div>
            <div class="invalid-feedback d-block mt-2" *ngIf="name.invalid && name.touched">Tên sản phẩm phải từ 3 ký tự trở lên.</div>
          </div>
          
          <div class="col-md-4">
            <label class="form-label-custom">Danh mục <span class="text-danger">*</span></label>
            <div class="input-group-custom">
               <i class="fa-solid fa-layer-group text-muted"></i>
               <select class="form-control-custom appearance-none"
                    [(ngModel)]="productData.category_id" name="categoryId" required #category="ngModel"
                    [class.is-invalid]="category.invalid && category.touched">
                  <option value="" disabled>Chọn danh mục...</option>
                  @for (cat of categories(); track cat.id) {
                    <option [value]="cat.id">{{ cat.name }}</option>
                  }
               </select>
               <i class="fa-solid fa-chevron-down position-absolute end-0 me-3 pointer-events-none text-muted small"></i>
            </div>
          </div>

          <!-- SECTION: CLASSIFICATION -->
          <div class="col-12 mt-5">
            <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                <h5 class="section-title mb-0"><i class="fa-solid fa-sitemap me-2"></i>Phân loại & Biến thể</h5>
                <button type="button" class="btn btn-primary-soft rounded-pill px-4 fw-bold" 
                        *ngIf="attributeGroups.length < 2" (click)="addAttributeGroup()">
                    <i class="fa-solid fa-plus-circle me-2"></i>Thêm nhóm phân loại
                </button>
            </div>

            <div class="row g-4">
               @for (group of attributeGroups; track $index; let i = $index) {
               <div class="col-lg-6">
                  <div class="attribute-box p-4 rounded-4 position-relative">
                      <button type="button" class="btn-remove-box" (click)="removeAttributeGroup(i)">
                         <i class="fa-solid fa-xmark"></i>
                      </button>
                      
                      <div class="mb-4">
                         <label class="form-label-custom small uppercase tracking-wider">Tên nhóm {{i+1}}</label>
                         <input type="text" class="form-control-custom-sm shadow-none" 
                               [(ngModel)]="group.name" [name]="'groupName' + i" 
                               placeholder="VD: Màu sắc, Kích thước..." (input)="generateVariants()">
                      </div>
                      
                      <div class="values-area">
                         <label class="form-label-custom small uppercase tracking-wider">Giá trị phân loại</label>
                         <div class="d-flex flex-wrap gap-2 mb-3">
                            @for (val of group.values; track $index; let j = $index) {
                            <span class="value-badge">
                               {{ val }}
                               <i class="fa-solid fa-circle-xmark ms-2 cursor-pointer" (click)="removeAttributeValue(i, j)"></i>
                            </span>
                            }
                         </div>
                         
                         <div class="input-group-custom">
                            <input type="text" class="form-control-custom-sm pe-5" #valInput 
                                  placeholder="Nhấn Enter để thêm..." 
                                  (keyup.enter)="addAttributeValue(i, valInput)">
                            <button class="btn btn-primary btn-sm rounded-3 position-absolute end-0 me-2 top-50 translate-middle-y py-1 px-3" 
                                    type="button" (click)="addAttributeValue(i, valInput)">Thêm</button>
                         </div>
                      </div>
                  </div>
               </div>
               }
            </div>

            <!-- Variants Table -->
            @if (productVariants.length > 0) {
            <div class="variants-container mt-5 rounded-4 overflow-hidden border border-light shadow-sm">
                <div class="variants-header p-4 bg-light d-flex flex-wrap gap-4 align-items-center justify-content-between">
                    <span class="fw-800 text-dark">Bảng biến thể chi tiết ({{ productVariants.length }})</span>
                    <div class="d-flex gap-3">
                        <div class="bulk-input">
                           <input type="number" class="form-control border-0 bg-white px-3" placeholder="Giá chung..." #bulkPrice>
                           <button type="button" class="btn btn-dark btn-sm py-1" (click)="updateAllPrices(bulkPrice.value)">Áp dụng</button>
                        </div>
                        <div class="bulk-input">
                           <input type="number" class="form-control border-0 bg-white px-3" placeholder="Kho chung..." #bulkStock>
                           <button type="button" class="btn btn-dark btn-sm py-1" (click)="updateAllStocks(bulkStock.value)">Áp dụng</button>
                        </div>
                    </div>
                </div>
                
                <div class="table-responsive">
                   <table class="table table-custom-variants mb-0">
                      <thead>
                         <tr>
                            @for (group of attributeGroups; track $index) {
                               <th>{{ group.name || 'Phân loại ' + ($index+1) }}</th>
                            }
                            <th style="width: 180px;">Giá bán (₫)</th>
                            <th style="width: 140px;">Kho hàng</th>
                            <th>Mã SKU</th>
                         </tr>
                      </thead>
                      <tbody>
                         @for (variant of productVariants; track $index) {
                         <tr>
                            @for (comboVal of variant.combination; track $index) {
                               <td><span class="fw-700 text-primary">{{ comboVal }}</span></td>
                            }
                            <td>
                               <input type="number" class="form-control-custom-sm bg-light text-center fw-bold text-primary" 
                                     [(ngModel)]="variant.price" [name]="'variantPrice' + $index" (input)="updateMinPriceFromVariants()">
                            </td>
                            <td>
                               <input type="number" class="form-control-custom-sm bg-light text-center" 
                                     [(ngModel)]="variant.stock" [name]="'variantStock' + $index">
                            </td>
                            <td>
                               <input type="text" class="form-control-custom-sm bg-light text-center text-muted small" 
                                     [(ngModel)]="variant.sku" [name]="'variantSku' + $index" placeholder="...">
                            </td>
                         </tr>
                         }
                      </tbody>
                   </table>
                </div>
            </div>
            }

            <div class="price-summary-box mt-4 p-4 rounded-4" [class.bg-indigo-soft]="productVariants.length > 0" [class.bg-amber-soft]="productVariants.length === 0">
               <div class="row align-items-center">
                  <div class="col-md-7">
                     <div class="d-flex align-items-center">
                        @if (productVariants.length > 0) {
                           <div class="icon-circle bg-indigo text-white me-3"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
                           <div>
                              <div class="fw-800 text-indigo mb-1">Đã cấu hình biến thể!</div>
                              <p class="mb-0 small text-indigo opacity-75">Giá niêm yết sẽ được lấy từ mức giá thấp nhất trong các phiên bản.</p>
                           </div>
                        } @else {
                           <div class="icon-circle bg-amber text-white me-3"><i class="fa-solid fa-lightbulb"></i></div>
                           <div>
                              <div class="fw-800 text-amber mb-1">Mẹo nhỏ cho bạn</div>
                              <p class="mb-0 small text-amber opacity-75">Thêm phân loại (màu sắc, size) để khách hàng có nhiều sự lựa chọn hơn.</p>
                           </div>
                        }
                     </div>
                  </div>
                  <div class="col-md-5 mt-3 mt-md-0">
                     <label class="form-label-custom small fw-800 text-dark">Giá niêm yết thấp nhất (₫)</label>
                     <div class="input-group-custom">
                        <i class="fa-solid fa-hand-holding-dollar text-muted"></i>
                        <input type="number" class="form-control-custom border-2 fw-800"
                             [(ngModel)]="productData.price" name="price" 
                             [required]="productVariants.length === 0" 
                             [readonly]="productVariants.length > 0"
                             min="1000" #price="ngModel"
                             [class.is-invalid]="price.invalid && price.touched"
                             [style.border-color]="productVariants.length > 0 ? '#6366f1' : '#e2e8f0'">
                     </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- SECTION: IMAGES -->
          <div class="col-12 mt-5">
             <h5 class="section-title"><i class="fa-solid fa-images me-2"></i>Hình ảnh & Truyền thông</h5>
             <div class="row g-4">
                <!-- Upload Dropzone -->
                <div class="col-lg-6">
                   <div class="drop-zone p-5 rounded-5 border-dashed text-center position-relative h-100 d-flex flex-column align-items-center justify-content-center">
                      <div class="upload-icon mb-3"><i class="fa-solid fa-images fs-1"></i></div>
                      <h6 class="fw-800">Tải ảnh lên từ máy tính</h6>
                      <p class="text-muted small px-lg-5 mb-4">Chọn một hoặc nhiều tệp ảnh. Định dạng hỗ trợ: JPG, PNG, WEBP.</p>
                      <input type="file" #fileInput hidden (change)="onFileChange($event)" multiple accept="image/*">
                      <button type="button" class="btn btn-dark rounded-pill px-5 py-3 fw-bold shadow-sm" (click)="fileInput.click()">
                         <i class="fa-solid fa-plus-circle me-2"></i>Chọn tập tin
                      </button>
                   </div>
                </div>

                <!-- URL Links -->
                <div class="col-lg-6">
                   <div class="p-4 bg-light rounded-5 h-100 border">
                      <label class="form-label-custom">Link ảnh từ Internet</label>
                      <div class="image-links-container">
                         @for (link of imageLinks; let idx = $index; track idx; let i = $index) {
                         <div class="input-group-custom mb-3">
                            <i class="fa-solid fa-link text-muted"></i>
                            <input type="text" class="form-control-custom-sm bg-white"
                                [(ngModel)]="imageLinks[i]" [name]="'imageLink' + i" placeholder="Nhập đường dẫn URL của ảnh...">
                            @if (imageLinks.length > 1) {
                               <button type="button" class="btn-remove-row" (click)="removeImageLink(i)">
                                  <i class="fa-solid fa-trash-can"></i>
                               </button>
                            }
                         </div>
                         }
                         <button type="button" class="btn btn-link text-primary fw-bold text-decoration-none p-0 small" (click)="addImageLink()">
                            <i class="fa-solid fa-plus-circle me-1"></i>Thêm đường dẫn khác
                         </button>
                      </div>
                   </div>
                </div>
             </div>

             <!-- NEW FILES PREVIEW -->
             @if (selectedFilesPreviews.length > 0) {
                <div class="mt-5 p-4 bg-indigo-soft border border-indigo-light rounded-5">
                   <label class="form-label-custom mb-4 d-flex align-items-center text-indigo">
                      <i class="fa-solid fa-cloud-arrow-up me-2"></i>
                      File vừa mới chọn ({{ selectedFilesPreviews.length }})
                      <span class="ms-2 badge bg-indigo text-white small fw-normal">Sắp được tải lên</span>
                   </label>
                   <div class="d-flex flex-wrap gap-4">
                      @for (prev of selectedFilesPreviews; track $index; let i = $index) {
                      <div class="image-manage-card new-file">
                         <img [src]="prev" class="img-fluid object-fit-cover rounded-4">
                         <div class="card-overlay">
                            <button type="button" class="btn-delete-img" (click)="removeSelectedFile(i)">
                               <i class="fa-solid fa-xmark"></i>
                            </button>
                         </div>
                         <div class="file-tag shadow-sm bg-indigo">MỚI</div>
                      </div>
                      }
                   </div>
                </div>
             }

             <!-- EXISTING IMAGES MANAGEMENT -->
             @if (isEditMode() && existingImages.length > 0) {
                <div class="mt-5 p-4 bg-white border border-light rounded-5 shadow-sm">
                   <div class="d-flex justify-content-between align-items-center mb-4">
                      <label class="form-label-custom mb-0 d-flex align-items-center">
                         <i class="fa-solid fa-grip-vertical me-2 text-muted"></i>
                         Thư viện ảnh hiện tại ({{ existingImages.length }})
                      </label>
                      <span class="text-muted small"><i class="fa-solid fa-info-circle me-1"></i>Kéo để đổi vị trí, click <i class="fa-solid fa-star text-warning"></i> để chọn ảnh chính</span>
                   </div>
                   
                   <div class="d-flex flex-wrap gap-4">
                      @for (img of existingImages; let i = $index; track img.id) {
                      <div class="image-manage-card" 
                           [class.is-primary]="productData.thumbnail === img.image_url"
                           draggable="true" 
                           (dragstart)="onDragStart(i)" 
                           (dragover)="onDragOver($event)" 
                           (drop)="onDrop($event, i)">
                         
                         <img [src]="getImageUrl(img.image_url)" class="img-fluid object-fit-cover rounded-4 shadow-sm">
                         
                         <div class="card-overlay">
                            <div class="d-flex flex-column gap-2">
                               <div class="d-flex gap-2">
                                  <button type="button" class="btn-action shadow" (click)="setPrimaryImage(img.image_url)" title="Đặt làm ảnh chính">
                                     <i class="fa-solid fa-star" [class.text-warning]="productData.thumbnail === img.image_url"></i>
                                  </button>
                                  @if (i > 0) {
                                     <button type="button" class="btn-action shadow" (click)="moveToFront(i)" title="Đưa lên đầu">
                                        <i class="fa-solid fa-arrow-up-to-line"></i>
                                     </button>
                                  }
                               </div>
                               <button type="button" class="btn-delete-full shadow w-100" (click)="deleteExistingImage(img.id)">
                                  <i class="fa-solid fa-trash-can me-2"></i>Xóa ảnh
                               </button>
                            </div>
                         </div>
                         
                         @if (productData.thumbnail === img.image_url) {
                            <div class="primary-tag shadow-sm">ẢNH CHÍNH</div>
                         }
                         @if (i === 0 && productData.thumbnail !== img.image_url) {
                            <div class="pos-tag shadow-sm bg-dark">VỊ TRÍ 1</div>
                         }
                      </div>
                      }
                   </div>
                </div>
             }
          </div>

          <!-- SECTION: DESCRIPTION -->
          <div class="col-12 mt-5">
             <h5 class="section-title"><i class="fa-solid fa-file-pen me-2"></i>Mô tả sản phẩm</h5>
             <div class="textarea-custom-wrapper p-1 rounded-5 border bg-light focus-within-brand">
                <textarea class="form-control border-0 bg-transparent p-4 fw-500 shadow-none" rows="8"
                         [(ngModel)]="productData.description" name="description" 
                         required #desc="ngModel" [class.is-invalid]="desc.invalid && desc.touched"
                         placeholder="Viết mô tả cuốn hút cho sản phẩm của bạn tại đây..."></textarea>
             </div>
             <div class="invalid-feedback d-block mt-2" *ngIf="desc.invalid && desc.touched">Vui lòng nhập mô tả sản phẩm.</div>
          </div>

          <!-- ACTIONS -->
          <div class="col-12 mt-5 pt-5 border-top d-flex flex-wrap gap-3 justify-content-end">
             <button type="button" class="btn btn-light-lg rounded-pill px-5 py-3 fw-bold order-2 order-md-1" (click)="goBack()">Hủy Thay Đổi</button>
             <button type="submit" class="btn btn-brand-lg rounded-pill px-5 py-3 fw-bold shadow-brand order-1 order-md-2 flex-grow-1 flex-md-grow-0"
                     [disabled]="productForm.invalid">
                <i class="fa-solid fa-floppy-disk me-2"></i> {{ isEditMode() ? 'Cập Nhật Sản Phẩm' : 'Lưu Sản Phẩm' }}
             </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .fw-800 { font-weight: 800; }
    .fw-700 { font-weight: 700; }
    .fw-500 { font-weight: 500; }
    .appearance-none { -webkit-appearance: none; -moz-appearance: none; appearance: none; }

    .section-title {
       font-weight: 800;
       color: #0f172a;
       margin-bottom: 2rem;
       font-size: 1.1rem;
       text-transform: uppercase;
       letter-spacing: 0.5px;
    }

    /* Custom Form Controls */
    .form-label-custom {
       display: block; font-weight: 700; color: #475569;
       font-size: 0.85rem; margin-bottom: 0.6rem;
    }
    .input-group-custom { position: relative; display: flex; align-items: center; }
    .input-group-custom i:first-of-type {
       position: absolute; left: 20px; color: #94a3b8; pointer-events: none;
    }
    .form-control-custom {
       width: 100%; padding: 16px 20px 16px 54px;
       border-radius: 16px; border: 1px solid #e2e8f0;
       background: #f8fafc; font-weight: 600;
       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .form-control-custom:focus {
       background: white; border-color: #6366f1;
       box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.1);
       outline: none;
    }

    .input-group-custom .form-control-custom-sm {
       padding-left: 48px;
    }

    .form-control-custom-sm {
       width: 100%; padding: 12px 16px;
       border-radius: 12px; border: 1px solid #e2e8f0;
       background: white; font-weight: 600; font-size: 0.9rem;
    }
    .form-control-custom-sm:focus { border-color: #6366f1; outline: none; }

    /* Attribute Box */
    .attribute-box { background: #f1f5f9; border: 1px solid #e2e8f0; }
    .btn-remove-box {
       position: absolute; top: -12px; right: -12px;
       width: 32px; height: 32px; border-radius: 50%;
       background: #f43f5e; color: white; border: none;
       display: flex; align-items: center; justify-content: center;
       box-shadow: 0 4px 8px rgba(244, 63, 94, 0.3);
       transition: all 0.2s;
    }
    .btn-remove-box:hover { transform: scale(1.1) rotate(90deg); }

    .value-badge {
       background: #6366f1; color: white;
       padding: 8px 16px; border-radius: 30px;
       font-weight: 700; font-size: 0.8rem;
       display: inline-flex; align-items: center;
       box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
    }

    /* Bulk Input */
    .bulk-input {
       display: flex; align-items: center; background: white;
       border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0;
       padding: 4px;
    }
    .bulk-input input { width: 100px; font-weight: 700; font-size: 0.8rem; }

    /* Variants Table */
    .table-custom-variants { border-collapse: separate; }
    .table-custom-variants thead th {
       font-weight: 800; font-size: 0.75rem; text-transform: uppercase;
       color: #64748b; padding: 1.5rem 1rem; border: none;
    }
    .table-custom-variants tbody td { padding: 1rem; border-top: 1px solid #f1f5f9; }

    /* Alerts and Boxes */
    .bg-indigo-soft { background: #eef2ff; border: 1px solid #e0e7ff; }
    .bg-amber-soft { background: #fffbeb; border: 1px solid #fef3c7; }
    .text-indigo { color: #4f46e5; }
    .text-amber { color: #d97706; }
    .icon-circle { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .bg-indigo { background: #6366f1; }
    .bg-amber { background: #f59e0b; }

    /* Image Upload Section */
    .drop-zone { border: 2px dashed #cbd5e1; background: #f8fafc; transition: all 0.3s; }
    .drop-zone:hover { border-color: #6366f1; background: #eef2ff; }
    .upload-icon { color: #6366f1; opacity: 0.6; }
    .btn-remove-row { background: transparent; border: none; color: #ef4444; width: 40px; }

    /* Image Management Card */
    .image-manage-card {
       width: 140px; height: 140px; position: relative;
       transition: all 0.3s; cursor: move;
    }
    .image-manage-card img { width: 100%; height: 100%; border: 3px solid transparent; }
    .image-manage-card.is-primary img { border-color: #6366f1; }
    
    .card-overlay {
       position: absolute; top: 0; left: 0; width: 100%; height: 100%;
       background: rgba(15, 23, 42, 0.4); border-radius: 16px;
       display: flex; align-items: center; justify-content: center; gap: 15px;
       opacity: 0; transition: all 0.2s;
    }
    .image-manage-card:hover .card-overlay { opacity: 1; }

    .btn-action {
       width: 42px; height: 42px; border-radius: 12px;
       background: white; color: #475569; border: none;
       display: flex; align-items: center; justify-content: center;
       transition: all 0.2s;
    }
    .btn-action:hover { background: #6366f1; color: white; transform: scale(1.1); }
    .btn-action i.text-warning { color: #f59e0b !important; }

    .btn-delete-full {
       background: #ef4444; color: white; border: none;
       padding: 8px 12px; border-radius: 12px; font-weight: 700; font-size: 0.75rem;
       transition: all 0.2s;
    }
    .btn-delete-full:hover { background: #dc2626; transform: translateY(-1px); }

    .primary-tag, .pos-tag, .file-tag {
       position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
       color: white; font-size: 0.6rem; font-weight: 800;
       padding: 4px 12px; border-radius: 30px; z-index: 10;
    }
    .primary-tag { background: #6366f1; }
    .pos-tag { background: #1e293b; }
    .file-tag { background: #6366f1; top: -10px; bottom: auto; }

    /* Textarea */
    .border-indigo-light { border-color: #e0e7ff !important; }
    .textarea-custom-wrapper { transition: all 0.3s; }
    .focus-within-brand:focus-within { border-color: #6366f1 !important; box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.1); }

    /* Global Brands */
    .btn-brand-lg {
       background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
       color: white; border: none; transition: all 0.3s;
    }
    .btn-brand-lg:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3); color: white; }
    .shadow-brand { box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3); }
    .btn-light-lg { background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569; }
    .btn-primary-soft { background: #eef2ff; color: #6366f1; border: none; }
    .bg-success-soft { background: #f0fdf4; color: #16a34a; }
    .badge-input-wrapper:focus-within { ring: 2px solid #6366f1; }
    input:focus { outline: none !important; }
    .cursor-pointer { cursor: pointer; }
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
   selectedFilesPreviews: string[] = [];
   imageLinks: string[] = ['']; 
   categories = signal<any[]>([]);
   existingImages: any[] = [];
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
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

   moveToFront(index: number) {
      if (index > 0) {
         const img = this.existingImages.splice(index, 1)[0];
         this.existingImages.unshift(img);
         // Optionally set as primary if moved to front
         // this.setPrimaryImage(img.image_url);
      }
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
          this.toastService.error('Lỗi: ' + (err.error || err.message));
        }
      });
    }
  }

  getImageUrl(thumbnail: string | null): string {
    if (!thumbnail || thumbnail === "") return 'https://via.placeholder.com/150x150?text=No+Image';
    if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) return thumbnail;
    if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) return thumbnail;
    return `${environment.apiBaseUrl}/products/images/${thumbnail}`;
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories.set(res),
      error: (err) => this.toastService.error('Lỗi tải danh mục: ' + err.message)
    });
  }

   onFileChange(event: any) {
      const files = Array.from(event.target.files) as File[];
      this.selectedFiles = [...this.selectedFiles, ...files];
      
      // Update previews
      this.selectedFilesPreviews = this.selectedFiles.map(file => URL.createObjectURL(file));
   }

   removeSelectedFile(index: number) {
      this.selectedFiles.splice(index, 1);
      this.selectedFilesPreviews.splice(index, 1);
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
      error: (err) => this.toastService.error('Lỗi tải sản phẩm: ' + err.message)
    });
  }

  saveProduct(form: any) {
    if (form.invalid) {
      this.toastService.warning('Vui lòng điền đầy đủ các trường bắt buộc!');
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
        error: (err) => this.toastService.error('Lỗi cập nhật: ' + (err.error || err.message))
      });
    } else {
      this.productService.createProduct(payload, token).subscribe({
        next: (res) => this.uploadImages(res.id, token),
        error: (err) => this.toastService.error('Lỗi khi tạo: ' + (err.error || err.message))
      });
    }
  }

  uploadImages(productId: number, token: string) {
    if (this.selectedFiles.length > 0) {
      this.productService.uploadImages(productId, this.selectedFiles, token).subscribe({
        next: () => {
          this.goBack();
        },
        error: (err) => {
          alert('Upload ảnh lỗi: ' + (err.error || err.message));
          this.goBack();
        }
      });
    } else {
      this.goBack();
    }
  }

  goBack() {
    this.router.navigate(['/admin/products']);
  }
}
