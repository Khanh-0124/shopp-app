import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiBaseUrl}/products`;
  private http = inject(HttpClient);

  getProducts(keyword: string, categoryId: number, page: number, limit: number): Observable<any> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('category_id', categoryId.toString())
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(this.apiUrl, { params });
  }

  getProductById(productId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${productId}`);
  }

  createProduct(productDTO: any, token: string): Observable<any> {
    return this.http.post(this.apiUrl, productDTO, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  updateProduct(productId: number, productDTO: any, token: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}`, productDTO, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  deleteProduct(productId: number, token: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${productId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'text' as 'json'
    });
  }

  deleteAllProducts(token: string): Observable<any> {
    return this.http.delete(this.apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'text' as 'json'
    });
  }

  uploadImages(productId: number, files: File[], token: string): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return this.http.post(`${this.apiUrl}/uploads/${productId}`, formData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  deleteProductImage(imageId: number, token: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/images/${imageId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'text' as 'json'
    });
  }
}
