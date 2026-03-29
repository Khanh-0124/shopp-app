import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiRegister = `${environment.apiBaseUrl}/users/register`
  private apiLogin = `${environment.apiBaseUrl}/users/login`
  private apiUserDetails = `${environment.apiBaseUrl}/users/details`
  
  // Use signal for reactive state
  private tokenSignal = signal<string | null>(localStorage.getItem('token'));
  
  constructor(private http: HttpClient) { }

  register(registerData: any): Observable<any> {
    const header = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post(this.apiRegister, registerData, { headers: header });
  }

  login(loginData: any): Observable<any> {
    const header = new HttpHeaders({
      'Content-Type': 'application/json'
    })
    return this.http.post(this.apiLogin, loginData, { headers: header }).pipe(
      tap((response: any) => {
        if (response.token) {
          this.saveToken(response.token);
        }
      })
    );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.tokenSignal.set(token);
  }

  saveRole(role: string) {
    localStorage.setItem('user_role', role);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  isLoggedIn = computed(() => this.tokenSignal() !== null);

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    this.tokenSignal.set(null);
  }

  getUserDetails(token: string): Observable<any> {
    return this.http.post(this.apiUserDetails, {}, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });
  }

  updateUser(userId: number, updateUserDTO: any, token: string): Observable<any> {
    return this.http.put(`${this.apiUserDetails}/${userId}`, updateUserDTO, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });
  }

  isAdmin = computed(() => {
    const token = this.tokenSignal();
    if (!token) return false;
    try {
      const payloadString = atob(token.split('.')[1]);
      const payload = JSON.parse(payloadString);
      // Check payload.role OR fallback to localStorage if role was fetched after login
      const roleFromToken = payload.role;
      const roleFromStorage = localStorage.getItem('user_role');
      return roleFromToken === 'ADMIN' || roleFromStorage === 'ADMIN'; 
    } catch(e) {
      return localStorage.getItem('user_role') === 'ADMIN';
    }
  });
}
