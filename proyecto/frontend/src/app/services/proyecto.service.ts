import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion?: string;
  progreso?: number;
  fecha_creacion?: string;
  fecha_fin?: string | null;
  estado?: string;
}

@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private readonly apiUrl = 'http://localhost:3003/api/proyectos';

  constructor(private http: HttpClient) {}

  // Obtener token desde el almacenamiento local
  private getAuthToken(): string | null {
    return localStorage.getItem('jwt'); // Asegúrate de que el token esté guardado en localStorage
  }

  // Obtener los encabezados de autorización
  private getAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        })
      : new HttpHeaders({
          'Content-Type': 'application/json',
        });
  }

  // Manejo de errores
  private handleError(error: any) {
    const message = error?.error?.message || 'Error inesperado del servidor';
    return throwError(() => new Error(message));
  }

  // Obtener todos los proyectos
  obtenerProyectos(): Observable<Proyecto[]> {
    const headers = this.getAuthHeaders(); // Obtener los encabezados con JWT
    return this.http.get<Proyecto[]>(this.apiUrl, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener proyecto por ID
  obtenerProyectoPorId(id: number): Observable<Proyecto> {
    const headers = this.getAuthHeaders(); // Obtener los encabezados con JWT
    return this.http.get<Proyecto>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Crear un nuevo proyecto
  crearProyecto(proyecto: Partial<Proyecto>): Observable<Proyecto> {
    const headers = this.getAuthHeaders(); // Obtener los encabezados con JWT
    return this.http.post<Proyecto>(this.apiUrl, proyecto, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar un proyecto existente
  actualizarProyecto(id: number, proyecto: Partial<Proyecto>): Observable<Proyecto> {
    const headers = this.getAuthHeaders(); // Obtener los encabezados con JWT
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}`, proyecto, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar un proyecto
  eliminarProyecto(id: number): Observable<void> {
    const headers = this.getAuthHeaders(); // Obtener los encabezados con JWT
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Finalizar un proyecto
  finalizarProyecto(id: number): Observable<Proyecto> {
    const headers = this.getAuthHeaders(); // Obtener los encabezados con JWT
    return this.http.put<Proyecto>(`${this.apiUrl}/${id}/finalizar`, {}, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}
