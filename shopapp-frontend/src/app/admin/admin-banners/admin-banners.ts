import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastService } from '../../service/toast.service';
import { BannerService } from '../../service/banner.service';

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="row mb-5 align-items-center animate-fade-in">
      <div class="col-md-6">
        <h2 class="fw-800 text-dark mb-1">Quản Lý Banner Trang Chủ</h2>
        <p class="text-muted small mb-0">Thiết kế không gian quảng bá cho cửa hàng của bạn</p>
      </div>
      <div class="col-md-6 text-md-end mt-3 mt-md-0">
        <button class="btn btn-brand-lg rounded-pill px-4 py-3 shadow-brand" (click)="openAddModal()">
          <i class="fa-solid fa-plus-circle me-2"></i>Thêm Banner Mới
        </button>
      </div>
    </div>

    <!-- Active Banners Grid -->
    <div class="row g-4 mb-5">
       @for (banner of banners(); track banner.id; let i = $index) {
       <div class="col-lg-6">
          <div class="banner-card rounded-5 overflow-hidden shadow-sm border border-light bg-white position-relative">
             <div class="banner-img-wrapper position-relative">
                <img [src]="getImageUrl(banner.image_url)" class="banner-img w-100 object-fit-cover" 
                     (error)="$event.target.src='https://via.placeholder.com/800x300?text=Banner+Image'">
                
                <div class="banner-overlay p-4 d-flex flex-column justify-content-between">
                   <div class="d-flex justify-content-between align-items-start">
                      <span class="badge rounded-pill px-3 py-2" [class.bg-success]="banner.active" [class.bg-secondary]="!banner.active">
                         {{ banner.active ? 'Đang hiển thị' : 'Đang ẩn' }}
                      </span>
                      <div class="d-flex gap-2">
                         <button class="btn btn-light btn-circle shadow-sm" (click)="editBanner(banner)"><i class="fa-solid fa-pen-to-square"></i></button>
                         <button class="btn btn-danger btn-circle shadow-sm" (click)="deleteBanner(banner.id)"><i class="fa-solid fa-trash-can"></i></button>
                      </div>
                   </div>
                   
                   <div class="banner-info text-white">
                      <h4 class="fw-800 mb-1">{{ banner.title }}</h4>
                      <p class="small opacity-80 mb-0">{{ banner.sub_title }}</p>
                   </div>
                </div>
             </div>
             
             <div class="p-3 bg-light d-flex align-items-center justify-content-between border-top">
                <div class="d-flex align-items-center gap-2">
                   <div class="form-check form-switch ms-2">
                      <input class="form-check-input cursor-pointer" type="checkbox" 
                             [checked]="banner.active" (change)="toggleBanner(banner)">
                   </div>
                   <span class="small fw-700 text-muted">Bật hiển thị</span>
                </div>
                <div class="text-muted small fw-600">
                   <i class="fa-solid fa-link me-2"></i>{{ banner.link || 'Không có liên kết' }}
                </div>
             </div>
          </div>
       </div>
       }
    </div>

    <!-- Empty State -->
    @if (banners().length === 0) {
       <div class="text-center py-5 bg-white rounded-5 border border-dashed">
          <div class="text-muted opacity-20 mb-3"><i class="fa-solid fa-image-slash display-1"></i></div>
          <h4 class="fw-800 text-muted">Chưa có banner nào được tạo</h4>
          <p class="text-muted small">Nhấn "Thêm Banner Mới" để bắt đầu thiết kế trang chủ.</p>
       </div>
    }

    <!-- MODAL: ADD/EDIT BANNER -->
    <div class="modal fade" id="bannerModal" tabindex="-1" aria-hidden="true" [class.show]="showModal" [style.display]="showModal ? 'block' : 'none'">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 rounded-5 shadow-2xl overflow-hidden animate-zoom">
          <div class="modal-header bg-dark p-4 border-0">
            <h5 class="modal-title fw-800 text-white"><i class="fa-solid fa-magic-sparkles me-2"></i>{{ isEdit ? 'Cập Nhật' : 'Tạo Mới' }} Banner</h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
          </div>
          <div class="modal-body p-4 p-lg-5">
             <form #bannerForm="ngForm">
                <div class="row g-4">
                   <div class="col-12">
                      <label class="form-label-custom-banner mb-2">Hình ảnh Banner (URL hoặc Upload)</label>
                      <div class="input-group-custom mb-3">
                         <i class="fa-solid fa-image text-muted"></i>
                         <input type="text" class="form-control-custom-banner" [(ngModel)]="currentBanner.image_url" name="image_url" placeholder="Nhập đường dẫn URL ảnh hoặc..." required>
                      </div>
                      
                      <div class="upload-area p-3 border border-dashed rounded-4 text-center bg-white">
                         <input type="file" id="fileInput" class="d-none" (change)="onFileSelected($event)" accept="image/*">
                         <button type="button" class="btn btn-outline-primary rounded-pill px-4" onclick="document.getElementById('fileInput').click()">
                            <i class="fa-solid fa-cloud-arrow-up me-2"></i>Tải Ảnh Lên Từ Máy Tính
                         </button>
                         <p class="small text-muted mt-2 mb-0">Hỗ trợ JPG, PNG (Tối đa 10MB)</p>
                      </div>
                   </div>
                   
                   <div class="col-md-6">
                      <label class="form-label-custom-banner mb-2">Tiêu đề chính</label>
                      <input type="text" class="form-control-custom-banner" [(ngModel)]="currentBanner.title" name="title" placeholder="VD: Khuyến mãi mùa hè">
                   </div>
                   
                   <div class="col-md-6">
                      <label class="form-label-custom-banner mb-2">Tiêu đề phụ</label>
                      <input type="text" class="form-control-custom-banner" [(ngModel)]="currentBanner.sub_title" name="sub_title" placeholder="VD: Giảm giá cực sâu đến 50%">
                   </div>

                   <div class="col-12">
                      <label class="form-label-custom-banner mb-2">Đường dẫn liên kết (Link)</label>
                      <input type="text" class="form-control-custom-banner" [(ngModel)]="currentBanner.link" name="link" placeholder="VD: /products?category=toys">
                   </div>
                   
                   <div class="col-12 mt-4 text-center">
                      <div class="preview-box p-3 bg-light rounded-4 border">
                         <span class="small fw-800 text-muted d-block mb-2">Xem Trước Banner</span>
                         <div class="preview-img-container rounded-3 overflow-hidden shadow-sm" style="height: 150px; background: #eee">
                            <img [src]="getImageUrl(currentBanner.image_url)" class="w-100 h-100 object-fit-cover" (error)="$event.target.src='https://via.placeholder.com/800x300?text=Banner+Preview'">
                         </div>
                      </div>
                   </div>
                </div>
             </form>
          </div>
          <div class="modal-footer p-4 border-light bg-light justify-content-center">
            <button type="button" class="btn btn-light-lg rounded-pill px-5 fw-bold" (click)="closeModal()">Thoát</button>
            <button type="button" class="btn btn-brand-lg rounded-pill px-5 fw-bold shadow-brand" (click)="saveBanner()">
               {{ isEdit ? 'Lưu Thay Đổi' : 'Lưu Banner' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" *ngIf="showModal"></div>
  `,
  styles: [`
    .fw-800 { font-weight: 800; }
    .btn-brand-lg {
       background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
       color: white; border: none; transition: all 0.3s;
    }
    .btn-brand-lg:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3); color: white; }
    .shadow-brand { box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
    
    .banner-card {
       transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
       &:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important; }
    }

    .banner-img-wrapper {
       height: 220px;
       .banner-img { height: 100%; transition: transform 0.5s; }
       &:hover .banner-img { transform: scale(1.05); }
    }

    .banner-overlay {
       position: absolute; top: 0; left: 0; width: 100%; height: 100%;
       background: linear-gradient(0deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0) 60%);
       z-index: 2;
    }

    .btn-circle {
       width: 38px; height: 38px; border-radius: 50%;
       display: flex; align-items: center; justify-content: center;
       border: none; transition: all 0.2s;
       &:hover { transform: scale(1.1); }
    }

    .form-label-custom-banner { font-weight: 800; color: #475569; font-size: 0.8rem; text-transform: uppercase; }
    .form-control-custom-banner {
       width: 100%; padding: 14px 18px; border-radius: 14px; border: 1px solid #e2e8f0;
       background: #f8fafc; font-weight: 600; transition: all 0.3s;
       &:focus { background: white; border-color: #6366f1; outline: none; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
    }

    .input-group-custom { position: relative; }
    .input-group-custom i { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
    .input-group-custom .form-control-custom-banner { padding-left: 50px; }

    .modal-backdrop { background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); }
    .animate-zoom { animation: zoomIn 0.3s ease-out; }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .border-dashed { border-style: dashed !important; }
  `]
})
export class AdminBannersComponent implements OnInit {
  banners = signal<any[]>([]);
  showModal = false;
  isEdit = false;
  currentBanner: any = { id: 0, title: '', sub_title: '', image_url: '', link: '', active: true };

  private bannerService = inject(BannerService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.loadBanners();
  }

  loadBanners() {
    this.bannerService.getBanners().subscribe({
      next: (res) => this.banners.set(res),
      error: (err) => this.toastService.error('Lỗi khi tải danh sách banner!')
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.bannerService.uploadImage(file).subscribe({
        next: (filename) => {
          this.currentBanner.image_url = filename;
          this.toastService.success('Đã tải ảnh lên thành công!');
        },
        error: (err) => this.toastService.error('Lỗi khi tải ảnh lên!')
      });
    }
  }

  getImageUrl(url: string | null): string {
    if (!url) return 'https://via.placeholder.com/800x300?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://localhost:8088/api/v1/banners/images/${url}`;
  }

  openAddModal() {
    this.isEdit = false;
    this.currentBanner = { title: '', sub_title: '', image_url: '', link: '', active: true };
    this.showModal = true;
  }

  editBanner(banner: any) {
    this.isEdit = true;
    this.currentBanner = { ...banner };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveBanner() {
    if (!this.currentBanner.image_url) {
      this.toastService.error('Vui lòng nhập URL ảnh banner!');
      return;
    }

    if (this.isEdit) {
      this.bannerService.updateBanner(this.currentBanner.id, this.currentBanner).subscribe({
        next: () => {
          this.toastService.success('Cập nhật banner thành công!');
          this.loadBanners();
          this.closeModal();
        },
        error: (err) => this.toastService.error('Lỗi cập nhật banner!')
      });
    } else {
      this.bannerService.createBanner(this.currentBanner).subscribe({
        next: () => {
          this.toastService.success('Thêm banner mới thành công!');
          this.loadBanners();
          this.closeModal();
        },
        error: (err) => this.toastService.error('Lỗi thêm banner!')
      });
    }
  }

  toggleBanner(banner: any) {
    const updated = { ...banner, active: !banner.active };
    this.bannerService.updateBanner(banner.id, updated).subscribe({
      next: () => {
        this.toastService.info(updated.active ? 'Đã bật hiển thị banner!' : 'Đã ẩn hiển thị banner!');
        this.loadBanners();
      },
      error: (err) => this.toastService.error('Lỗi thay đổi trạng thái!')
    });
  }

  deleteBanner(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa banner này không?')) {
      this.bannerService.deleteBanner(id).subscribe({
        next: () => {
          this.toastService.warning('Đã xóa banner!');
          this.loadBanners();
        },
        error: (err) => this.toastService.error('Lỗi khi xóa banner!')
      });
    }
  }
}
