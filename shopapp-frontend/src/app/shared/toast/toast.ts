import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../service/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-4" style="z-index: 10000; pointer-events: none;">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-card mb-3 d-flex align-items-center p-3 animate-slide-in shadow-lg" 
             [ngClass]="'toast-' + toast.type"
             style="pointer-events: auto;">
          <div class="toast-icon me-3">
            <i class="fa-solid" [ngClass]="{
              'fa-circle-check': toast.type === 'success',
              'fa-circle-xmark': toast.type === 'error',
              'fa-circle-exclamation': toast.type === 'warning',
              'fa-circle-info': toast.type === 'info'
            }"></i>
          </div>
          <div class="toast-message flex-grow-1 pe-3">
            {{ toast.message }}
          </div>
          <button class="btn-close btn-close-white ms-auto" (click)="toastService.remove(toast.id)"></button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-card {
      min-width: 320px;
      max-width: 450px;
      border-radius: 16px;
      color: white;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .toast-success { background: linear-gradient(135deg, #10B981 0%, #059669 100%); }
    .toast-error { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); }
    .toast-warning { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
    .toast-info { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }

    .toast-icon { font-size: 1.5rem; }
    .toast-message { font-weight: 500; font-size: 0.95rem; }

    .animate-slide-in {
      animation: slideIn 0.4s ease-out;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
