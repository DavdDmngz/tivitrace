import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3003/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { correo: string; contrasena: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials);
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

  getNombreUsuario(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.nombre && decoded?.apellido ? `${decoded.nombre} ${decoded.apellido}` : null;
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
}
