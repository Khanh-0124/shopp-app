import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private http = inject(HttpClient);
  private apiBaseUrl = environment.apiBaseUrl;

  getAllOrders(keyword: string, page: number, limit: number): Observable<any> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get(`${this.apiBaseUrl}/orders/get-orders-by-keyword`, { params });
  }

  getOrderDetails(orderId: number): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/orders/${orderId}`);
  }

  updateOrderStatus(orderId: number, orderData: any): Observable<any> {
    return this.http.put(`${this.apiBaseUrl}/orders/${orderId}`, orderData);
  }

  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete(`${this.apiBaseUrl}/orders/${orderId}`);
  }
}
