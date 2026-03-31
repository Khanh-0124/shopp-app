import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';
import { OrderListService } from '../service/order-list.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './order.html',
  styleUrl: './order.scss',
})
export class OrderComponent {
  private orderListService = inject(OrderListService);

  orderItems = this.orderListService.orderItems;
  totalQuantity = this.orderListService.totalQuantity;

  totalPrice = computed(() => 
    this.orderItems().reduce((total: number, item: any) => total + (item.price * item.quantity), 0)
  );

  removeFromOrder(id: number) {
    this.orderListService.removeFromOrder(id);
  }

  getImageUrl(imageName: string | null): string {
    if (!imageName || imageName === "") return 'https://via.placeholder.com/150x150?text=No+Image';
    if (imageName.startsWith('http://') || imageName.startsWith('https://')) return imageName;
    return `${environment.apiBaseUrl}/products/images/${imageName}`;
  }
}
