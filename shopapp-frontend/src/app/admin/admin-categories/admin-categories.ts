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
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden" style="background: white;">
      <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
        <h4 class="mb-0 fw-bold">Quản Lý Danh Mục</h4>
        <button class="btn btn-primary rounded-pill fw-bold shadow-sm px-4" (click)="openAddModal()">
          <i class="fa-solid fa-plus me-2"></i>Thêm Danh Mục
        </button>
      </div>
      
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th scope="col" class="ps-4 py-3 text-secondary text-uppercase small fw-bold">ID</th>
                <th scope="col" class="py-3 text-secondary text-uppercase small fw-bold">Tên Danh Mục</th>
                <th scope="col" class="py-3 text-secondary text-uppercase small fw-bold text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              @for (category of categories(); track category.id) {
              <tr style="transition: all 0.2s ease;">
                <td class="ps-4 fw-medium text-muted">#{{ category.id }}</td>
                <td class="fw-bold text-dark">{{ category.name }}</td>
                <td class="text-end pe-4">
                  <div class="btn-group shadow-sm rounded-pill">
                    <button class="btn btn-light text-primary py-2 px-3 border-secondary border-opacity-25" (click)="openEditModal(category)" title="Chỉnh sửa">
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-light text-danger py-2 px-3 border-secondary border-opacity-25" (click)="deleteCategory(category.id)" title="Xóa">
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

    <!-- Modal (Overlay simple custom) -->
    @if (showModal()) {
    <div class="modal-overlay d-flex align-items-center justify-content-center">
      <div class="modal-card bg-white rounded-4 shadow-lg p-5" style="width: 450px;">
        <h3 class="fw-bold mb-4">{{ modalTitle() }}</h3>
        <div class="mb-4">
          <label class="form-label text-muted small text-uppercase fw-bold">Tên danh mục</label>
          <input type="text" class="form-control form-control-lg bg-light border-0 shadow-sm rounded-3" 
                 [(ngModel)]="categoryForm.name" placeholder="Nhập tên...">
        </div>
        <div class="d-flex justify-content-end gap-3">
          <button class="btn btn-light rounded-pill px-4 fw-bold" (click)="closeModal()">Hủy</button>
          <button class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" (click)="saveCategory()">Lưu Lại</button>
        </div>
      </div>
    </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
      backdrop-filter: blur(4px);
    }
    .modal-card {
      animation: slideUp 0.3s ease-out;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
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
