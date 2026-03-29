import { Component, inject } from '@angular/core';
import { LoadingService } from '../service/loading.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
    <div class="loading-overlay">
      <div class="spinner-container">
        <div class="spinner"></div>
        <p class="loading-text">Đang tải...</p>
      </div>
    </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.3s ease;
    }

    .spinner-container {
      text-align: center;
      background: rgba(255, 255, 255, 0.8);
      padding: 30px 40px;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #6a11cb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    .loading-text {
      color: #333;
      font-weight: 600;
      margin: 0;
      letter-spacing: 1px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class LoadingComponent {
  loadingService = inject(LoadingService);
}
