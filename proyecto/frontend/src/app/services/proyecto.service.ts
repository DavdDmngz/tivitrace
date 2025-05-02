import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  progreso?: number;
  fechaInicio?: string;
  fechaFin?: string | null;
  creador?: string; // 👈 Agrega esta línea
}


@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private readonly apiUrl = 'http://localhost:3003/api/proyectos';

  constructor(private http: HttpClient) {}

  // Obtener las cabeceras de autenticación con el token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '', // Asegúrate de que el token se envíe con 'Bearer'
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any) {
    const message = error?.error?.message || 'Error inesperado del servidor';
    return throwError(() => new Error(message));
  }

  // Obtener todos los proyectos
  obtenerProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(this.apiUrl, { headers: this.getAuthHeaders(), withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  // Obtener proyecto por ID
  obtenerProyectoPorId(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Crear un nuevo proyecto
  crearProyecto(proyecto: Partial<Proyecto>): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.apiUrl, proyecto, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Actualizar un proyecto existente
  actualizarProyecto(id: number, proyecto: Partial<Proyecto>): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}`, proyecto, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Eliminar un proyecto
  eliminarProyecto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
}
