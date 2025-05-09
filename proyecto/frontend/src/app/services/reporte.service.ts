import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service'; // Ajusta la ruta según la ubicación real del archivo
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'http://localhost:3003/api/reportes'; // Asegúrate de que esta URL es la correcta

  constructor(private http: HttpClient, private authService: AuthService) {}

  obtenerDashboard(): Observable<any> {
    const token = this.authService.getToken(); // Obtener el token del AuthService

    const headers = {
      Authorization: `Bearer ${token}` // Agregar el token al header Authorization
    };

    return this.http.get(`${this.apiUrl}/dashboard`, { headers });
  }

  obtenerUsuariosPorEstado(): Observable<any> {
    const token = this.authService.getToken();
    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.get(`${this.apiUrl}/usuarios-por-estado`, { headers });
  }

  obtenerProyectosPorFecha(startDate: string, endDate: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.get(`${this.apiUrl}/proyectos-por-fecha`, {
      headers,
      params: { startDate, endDate }
    });
  }

  obtenerTareasPorProyecto(): Observable<any> {
    const token = this.authService.getToken();
    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.get(`${this.apiUrl}/tareas-por-proyecto`, { headers });
  }

  obtenerUsuariosConMasTareas(): Observable<any> {
    const token = this.authService.getToken();
    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.get(`${this.apiUrl}/usuarios-con-mas-tareas`, { headers });
  }

  obtenerProyectosCercaFechaFin(): Observable<any> {
    const token = this.authService.getToken();
    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.get(`${this.apiUrl}/proyectos-cerca-fecha-fin`, { headers });
  }

  obtenerPromedioTiempoEjecucion(): Observable<any> {
    const token = this.authService.getToken();
    const headers = {
      Authorization: `Bearer ${token}`
    };

    return this.http.get(`${this.apiUrl}/promedio-tiempo-ejecucion`, { headers });
  }
}
