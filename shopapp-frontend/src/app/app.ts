import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from './loading/loading';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LoadingComponent,
  ],
  template: `
    <app-loading></app-loading>
    <router-outlet></router-outlet>
    
    <!-- Floating Contact Buttons -->
    <div class="floating-contact-wrapper">
      <!-- Phone/Hotline Button -->
      <a href="tel:0336969201" class="contact-floating-item phone-floating">
        <div class="contact-tooltip">Gọi hotline</div>
        <div class="contact-icon-container">
          <img src="/icons/phone.png" alt="Phone Contact">
        </div>
      </a>

      <!-- Zalo Button -->
      <a href="https://zalo.me/0336969201" target="_blank" class="contact-floating-item zalo-floating">
        <div class="contact-tooltip">Chat Zalo</div>
        <div class="contact-icon-container">
          <img src="/icons/zalo.svg" alt="Zalo Contact">
        </div>
      </a>
    </div>
  `,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('shopapp-angular');
}
