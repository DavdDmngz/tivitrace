import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3003/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { correo: string; contrasena: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.accessToken && response.refreshToken) {
          localStorage.setItem('jwt', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      })
    );
  }  

  logout() {
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt');
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (e) {
      console.error('Error al decodificar token', e);
      return null;
    }
  }

  getRoles(): string[] {
    const decoded = this.getDecodedToken();
    return decoded?.roles || [];
  }

  hasRole(rol: string): boolean {
    return this.getRoles().includes(rol);
  }

  getUsuarioId(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.id || null;
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('jwt');
    if (!token) return true;
    const payload: any = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  }
  
  refreshToken(): Observable<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return of(false);
  
    return this.http.post<any>('http://localhost:3003/api/auth/refresh', { refreshToken }).pipe(
      switchMap(response => {
        localStorage.setItem('jwt', response.accessToken);
        return of(true);
      }),
      catchError(() => of(false))
    );
  }
  
}
