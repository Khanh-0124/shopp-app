import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = `${environment.apiBaseUrl}/banners`;
  private http = inject(HttpClient);

  getBanners(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getActiveBanners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active`);
  }

  createBanner(bannerDTO: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.post(this.apiUrl, bannerDTO, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  updateBanner(id: number, bannerDTO: any): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.put(`${this.apiUrl}/${id}`, bannerDTO, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  deleteBanner(id: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'text' as 'json'
    });
  }
}
