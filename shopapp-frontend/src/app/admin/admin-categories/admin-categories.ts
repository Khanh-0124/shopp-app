import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../service/category.service';
import { UserService } from '../../service/user.service';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="row mb-4 align-items-center">
      <div class="col-md-6">
        <h2 class="fw-800 text-dark mb-1">Quản Lý Danh Mục</h2>
        <p class="text-muted small mb-0">Tổ chức và quản lý các nhóm sản phẩm của bạn</p>
      </div>
      <div class="col-md-6 text-md-end mt-3 mt-md-0">
        <button class="btn btn-brand-lg rounded-4 fw-bold shadow-brand px-4 py-3" (click)="openAddModal()">
          <i class="fa-solid fa-plus me-2"></i>Thêm Danh Mục Mới
        </button>
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-custom align-middle mb-0">
            <thead>
              <tr>
                <th scope="col" class="ps-4">ID</th>
                <th scope="col">Tên Danh Mục</th>
                <th scope="col" class="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @for (category of categories(); track category.id) {
              <tr>
                <td class="ps-4">
                  <span class="badge bg-light text-muted rounded-pill px-3 py-2">#{{ category.id }}</span>
                </td>
                <td>
                  <div class="fw-bold text-dark fs-6">{{ category.name }}</div>
                </td>
                <td class="text-end pe-4">
                  <div class="action-btns d-inline-flex gap-2">
                    <button class="btn btn-icon-sm btn-edit shadow-sm" (click)="openEditModal(category)" title="Chỉnh sửa">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-icon-sm btn-delete shadow-sm" (click)="deleteCategory(category.id)" title="Xóa">
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
    </div>

    <!-- Modern Modal Container -->
    @if (showModal()) {
    <div class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3">
      <div class="modal-container-custom bg-white shadow-2xl rounded-5 p-4 p-md-5 overflow-hidden position-relative">
        <!-- Close Button -->
        <button class="btn-close-custom position-absolute top-0 end-0 m-4" (click)="closeModal()">
           <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="modal-header-custom mb-4">
           <div class="icon-shape bg-primary-soft text-primary mb-3">
              <i class="fa-solid fa-layer-group fs-4"></i>
           </div>
           <h3 class="fw-800 text-dark mb-1">{{ modalTitle() }}</h3>
           <p class="text-muted small">Thông tin danh mục sản phẩm</p>
        </div>

        <div class="modal-body-custom mb-5">
          <div class="form-group-custom">
            <label class="form-label text-dark fw-700 small mb-2">Tên danh mục <span class="text-danger">*</span></label>
            <div class="input-group-custom">
               <i class="fa-solid fa-tag text-muted"></i>
               <input type="text" class="form-control-custom" 
                      [(ngModel)]="categoryForm.name" placeholder="Ví dụ: Điện tử, Thời trang...">
            </div>
          </div>
        </div>

        <div class="modal-footer-custom d-flex gap-3">
          <button class="btn btn-light-lg rounded-4 px-4 flex-grow-1 fw-bold" (click)="closeModal()">Hủy</button>
          <button class="btn btn-brand-lg rounded-4 px-4 flex-grow-1 fw-bold shadow-brand" (click)="saveCategory()">
            <i class="fa-solid fa-check me-2"></i>Lưu Lại
          </button>
        </div>
      </div>
    </div>
    }
  `,
  styles: [`
    .fw-800 { font-weight: 800; }
    .fw-700 { font-weight: 700; }

    /* Button Styling */
    .btn-brand-lg {
       background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
       color: white;
       border: none;
       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-brand-lg:hover {
       transform: translateY(-2px);
       box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
       color: white;
    }
    .shadow-brand { box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.3); }

    .btn-light-lg {
       background: #f1f5f9;
       border: 1px solid #e2e8f0;
       color: #475569;
       transition: all 0.2s;
    }
    .btn-light-lg:hover { background: #e2e8f0; color: #1e293b; }

    /* Table Styling */
    .table-custom { border-collapse: separate; border-spacing: 0 8px; margin-top: -8px; }
    .table-custom thead th {
       background: transparent;
       border-bottom: none;
       color: #64748b;
       text-transform: uppercase;
       font-size: 0.75rem;
       font-weight: 700;
       letter-spacing: 0.5px;
       padding: 1.5rem 1rem;
    }
    .table-custom tbody tr {
       background: white;
       transition: all 0.2s;
       cursor: pointer;
    }
    .table-custom tbody tr:hover {
       background: #f8fafc;
       transform: scale(1.002);
    }
    .table-custom tbody td {
       border-top: 1px solid #f1f5f9;
       border-bottom: 1px solid #f1f5f9;
       padding: 1.2rem 1rem;
    }
    .table-custom tbody td:first-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
    .table-custom tbody td:last-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 12px; border-bottom-right-radius: 12px; }

    /* Action Buttons */
    .btn-icon-sm {
       width: 38px;
       height: 38px;
       display: flex;
       align-items: center;
       justify-content: center;
       border-radius: 10px;
       border: none;
       transition: all 0.2s;
    }
    .btn-edit { background: #eff6ff; color: #2563eb; }
    .btn-edit:hover { background: #2563eb; color: white; }
    .btn-delete { background: #fef2f2; color: #ef4444; }
    .btn-delete:hover { background: #ef4444; color: white; }

    /* Modal Styling */
    .modal-backdrop-custom {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      z-index: 2000;
      animation: fadeIn 0.3s ease;
    }
    .modal-container-custom {
      width: 100%;
      max-width: 500px;
      animation: modalSlideUp 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    }
    .icon-shape {
       width: 56px;
       height: 56px;
       border-radius: 16px;
       display: flex;
       align-items: center;
       justify-content: center;
    }
    .bg-primary-soft { background: #eef2ff; }

    /* Input Custom */
    .form-control-custom {
       width: 100%;
       padding: 14px 16px 14px 44px;
       border-radius: 14px;
       border: 1px solid #e2e8f0;
       background: #f8fafc;
       font-weight: 500;
       transition: all 0.3s;
    }
    .form-control-custom:focus {
       background: white;
       border-color: #6366f1;
       box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
       outline: none;
    }
    .input-group-custom { position: relative; }
    .input-group-custom i {
       position: absolute;
       left: 16px;
       top: 50%;
       transform: translateY(-50%);
       pointer-events: none;
    }

    .btn-close-custom {
       background: #f1f5f9;
       border: none;
       width: 36px;
       height: 36px;
       border-radius: 50%;
       display: flex;
       align-items: center;
       justify-content: center;
       color: #64748b;
       transition: all 0.2s;
    }
    .btn-close-custom:hover { background: #e2e8f0; color: #0f172a; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes modalSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]

})
export class AdminCategoriesComponent implements OnInit {
  categories = signal<any[]>([]);
  showModal = signal<boolean>(false);
  modalTitle = signal<string>('Thêm Danh Mục');
  isEdit = signal<boolean>(false);

  categoryForm = {
    id: 0,
    name: ''
  };

  private categoryService = inject(CategoryService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res) => this.categories.set(res),
      error: (err) => console.error(err)
    });
  }

  openAddModal() {
    this.isEdit.set(false);
    this.modalTitle.set('Thêm Danh Mục');
    this.categoryForm = { id: 0, name: '' };
    this.showModal.set(true);
  }

  openEditModal(category: any) {
    this.isEdit.set(true);
    this.modalTitle.set('Chỉnh Sửa');
    this.categoryForm = { id: category.id, name: category.name };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveCategory() {
    const token = this.userService.getToken();
    if (!token) return;

    const dto = { name: this.categoryForm.name };
    if (this.isEdit()) {
      this.categoryService.updateCategory(this.categoryForm.id, dto, token).subscribe({
        next: () => {
          this.toastService.success('Cập nhật danh mục thành công');
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => this.toastService.error('Lỗi: ' + (err.error || err.message))
      });
    } else {
      this.categoryService.createCategory(dto, token).subscribe({
        next: () => {
          this.toastService.success('Thêm danh mục thành công');
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => this.toastService.error('Lỗi: ' + (err.error || err.message))
      });
    }
  }

  deleteCategory(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      const token = this.userService.getToken();
      if (!token) return;
      this.categoryService.deleteCategory(id, token).subscribe({
        next: () => {
          this.toastService.success('Xóa danh mục thành công');
          this.loadCategories();
        },
        error: (err) => this.toastService.error('Lỗi xóa danh mục: ' + (err.error || err.message))
      });
    }
  }
}
