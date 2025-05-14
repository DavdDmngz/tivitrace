import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'http://localhost:3003/api/reportes';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return {
      Authorization: `Bearer ${token}`
    };
  }

  obtenerDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerUsuariosPorEstado(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios-por-estado`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerProyectosPorFecha(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos-por-fecha`, {
      headers: this.getAuthHeaders(),
      params: { startDate, endDate }
    });
  }

  obtenerTareasPorProyecto(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tareas-por-proyecto`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerUsuariosConMasTareas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios-con-mas-tareas`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerProyectosCercaFechaFin(): Observable<any> {
    return this.http.get(`${this.apiUrl}/proyectos-cerca-fecha-fin`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerPromedioTiempoEjecucion(): Observable<any> {
    return this.http.get(`${this.apiUrl}/promedio-tiempo-ejecucion`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerTareasPorEstado(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tareas-por-estado`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerAvancePorProyecto(): Observable<any> {
    return this.http.get(`${this.apiUrl}/avance-por-proyecto`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerProgresoGeneral(): Observable<any> {
    return this.http.get(`${this.apiUrl}/progreso-general`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerResumenPorUsuario(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen-por-usuario/${usuarioId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
