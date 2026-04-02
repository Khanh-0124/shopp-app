import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiBaseUrl}/categories`;
  private http = inject(HttpClient);
  private lastCacheKey = '';
  private cachedData = signal<any>(null);

  clearCache() {
    this.lastCacheKey = '';
    this.cachedData.set(null);
  }

  getCategories(page: number = 0, limit: number = 100): Observable<any> {
    const cacheKey = `${page}-${limit}`;
    if (this.cachedData() && this.lastCacheKey === cacheKey) {
      return of(this.cachedData());
    }
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`).pipe(
      tap(res => {
        this.cachedData.set(res);
        this.lastCacheKey = cacheKey;
      })
    );
  }

  createCategory(categoryDTO: any, token: string): Observable<any> {
    return this.http.post(this.apiUrl, categoryDTO, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(tap(() => this.clearCache()));
  }

  updateCategory(id: number, categoryDTO: any, token: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, categoryDTO, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(tap(() => this.clearCache()));
  }

  deleteCategory(id: number, token: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'text' as 'json'
    }).pipe(tap(() => this.clearCache()));
  }
}
