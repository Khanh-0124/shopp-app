import { Injectable, signal, computed } from '@angular/core';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderListService {
  private items = signal<OrderItem[]>(this.loadFromStorage());

  // Signal exposed for components to consume
  readonly orderItems = this.items.asReadonly();

  // Computed value for total quantity (badge)
  readonly totalQuantity = computed(() => 
    this.items().reduce((total, item) => total + item.quantity, 0)
  );

  private loadFromStorage(): OrderItem[] {
    const data = localStorage.getItem('order_list');
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(items: OrderItem[]) {
    localStorage.setItem('order_list', JSON.stringify(items));
  }

  addToOrder(product: any, quantity: number) {
    const currentItems = this.items();
    const existingItemIndex = currentItems.findIndex(i => i.id === product.id);

    let updatedItems: OrderItem[];
    if (existingItemIndex > -1) {
      updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
    } else {
      updatedItems = [...currentItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
        quantity: quantity
      }];
    }

    this.items.set(updatedItems);
    this.saveToStorage(updatedItems);
  }

  removeFromOrder(id: number) {
    const updatedItems = this.items().filter(item => item.id !== id);
    this.items.set(updatedItems);
    this.saveToStorage(updatedItems);
  }

  clearOrder() {
    this.items.set([]);
    localStorage.removeItem('order_list');
  }
}
