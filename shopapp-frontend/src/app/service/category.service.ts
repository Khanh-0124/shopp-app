import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiBaseUrl}/categories`;
  private http = inject(HttpClient);

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createCategory(categoryDTO: any, token: string): Observable<any> {
    return this.http.post(this.apiUrl, categoryDTO, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  updateCategory(id: number, categoryDTO: any, token: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, categoryDTO, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  deleteCategory(id: number, token: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'text' as 'json'
    });
  }
}
