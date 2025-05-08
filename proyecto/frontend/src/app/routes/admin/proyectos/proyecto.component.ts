import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { ProyectoService, Proyecto } from '../../../services/proyecto.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-proyecto',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './proyecto.component.html',
})
export class ProyectoComponent implements OnInit {
  proyectos: Proyecto[] = [];
  proyectosFinalizados: Proyecto[] = [];
  proyectoNuevo: Partial<Proyecto> = this.resetProyecto();
  nombreUsuario: string = '';
  cargando: boolean = true; // Nueva propiedad para controlar el estado de carga
  tareaSeleccionada: Proyecto | null = null; // Nueva propiedad para gestionar la tarea seleccionada

  constructor(
    private proyectoService: ProyectoService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarProyectos();
    this.cargarNombreUsuario();
  }

  cargarProyectos(): void {
    this.cargando = true; // Inicia carga
    this.proyectoService.obtenerProyectos().subscribe({
      next: (proyectos) => {
        this.proyectos = proyectos.filter(p => (p.progreso ?? 0) < 100);
        this.proyectosFinalizados = proyectos.filter(p => p.progreso === 100);
        this.cargando = false; // Finaliza carga
      },
      error: (err) => {
        alert(err.message);
        this.cargando = false; // Finaliza carga aunque haya error
      },
    });
  }

  cargarNombreUsuario(): void {
    const usuarioId = this.authService.getUsuarioId();
    if (usuarioId) {
      this.http.get<{ nombre: string; apellido: string }>(`http://localhost:3003/api/usuarios/${usuarioId}`)
        .subscribe({
          next: (usuario) => {
            this.nombreUsuario = `${usuario.nombre} ${usuario.apellido}`;
          },
          error: (err) => {
            console.error('Error al obtener el usuario:', err);
            alert('No se pudo cargar el nombre del usuario.');
          },
        });
    }
  }

  crearProyecto(): void {
    const { nombre, fechaFin } = this.proyectoNuevo;

    if (!nombre?.trim()) {
      alert('El nombre del proyecto es obligatorio.');
      return;
    }

    const proyecto: Partial<Proyecto> = {
      ...this.proyectoNuevo,
      fechaFin: fechaFin ? new Date(fechaFin).toISOString().split('T')[0] : null,
    };

    this.proyectoService.crearProyecto(proyecto).subscribe({
      next: (nuevo) => {
        this.proyectos.push(nuevo);
        this.proyectoNuevo = this.resetProyecto();
        alert('Proyecto creado.');
      },
      error: (err) => alert(err.message),
    });
  }

  eliminarProyecto(id: number): void {
    if (!confirm('¿Deseas eliminar este proyecto?')) return;

    this.proyectoService.eliminarProyecto(id).subscribe({
      next: () => {
        this.proyectos = this.proyectos.filter(p => p.id !== id);
        this.proyectosFinalizados = this.proyectosFinalizados.filter(p => p.id !== id);
        alert('Proyecto eliminado.');
      },
      error: (err) => alert(err.message),
    });
  }

  editarProyecto(proyecto: Proyecto): void {
    const { nombre, fechaFin } = proyecto;

    if (!nombre?.trim()) {
      alert('El nombre del proyecto es obligatorio.');
      return;
    }

    const proyectoActualizado: Partial<Proyecto> = {
      ...proyecto,
      fechaFin: fechaFin ? new Date(fechaFin).toISOString().split('T')[0] : null,
    };

    this.proyectoService.actualizarProyecto(proyecto.id, proyectoActualizado).subscribe({
      next: () => {
        this.cargarProyectos();
        alert('Proyecto actualizado.');
      },
      error: (err) => alert(err.message),
    });
  }

  eliminarProyectoFinalizado(id: number): void {
    if (!confirm('¿Deseas eliminar este proyecto finalizado?')) return;

    this.proyectoService.eliminarProyecto(id).subscribe({
      next: () => {
        this.proyectosFinalizados = this.proyectosFinalizados.filter(p => p.id !== id);
        alert('Proyecto finalizado eliminado.');
      },
      error: (err) => alert(err.message),
    });
  }

  // Función para gestionar la tarea seleccionada
  seleccionarTarea(proyecto: Proyecto): void {
    if (this.tareaSeleccionada === proyecto) {
      this.tareaSeleccionada = null; // Desmarcar la tarea si ya está seleccionada
    } else {
      this.tareaSeleccionada = proyecto; // Marcar la tarea como seleccionada
    }
  }

  private resetProyecto(): Partial<Proyecto> {
    return { nombre: '', descripcion: '', progreso: 0, fechaInicio: '', fechaFin: '' };
  }
}
