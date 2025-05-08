import {
  Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { ProyectoService, Proyecto } from '../../../services/proyecto.service';
import { AuthService } from '../../../services/auth.service';

interface Tarea {
  id?: number;
  nombre: string;
  descripcion?: string;
  estado: 'pendiente' | 'en progreso' | 'finalizado';
  proyecto_id: number;
}

@Component({
  selector: 'app-detalle-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './proyecto-detalle.component.html',
})
export class DetalleProyectoComponent implements OnInit {
  proyectoId!: number;
  proyecto!: Proyecto;
  tareas: Tarea[] = [];
  noTareas: boolean = false;

  participantes: string[] = [];
  nuevoParticipante: string = '';
  tareaEnEdicion: Tarea | null = null;
  tareaNombreOriginal: string | null = null;
  editingField: keyof Proyecto | null = null;
  nuevoValor: string = '';

  @ViewChild('nombreTareaInput') nombreTareaInput!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private proyectoService: ProyectoService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || isNaN(+idParam)) {
      console.error('ID de proyecto inválido');
      this.router.navigate(['/proyectos']);
      return;
    }

    this.proyectoId = +idParam;
    this.cargarProyecto();
    this.cargarTareas();
  }

  cargarProyecto(): void {
    this.proyectoService.obtenerProyectoPorId(this.proyectoId).subscribe({
      next: (proyecto) => (this.proyecto = proyecto),
      error: (err) => console.error('Error al cargar el proyecto:', err),
    });
  }

  cargarTareas(): void {
    this.http.get<Tarea[]>(`http://localhost:3003/api/tareas`, {
      params: { proyecto_id: this.proyectoId.toString() }
    }).subscribe({
      next: (data) => {
        this.tareas = data;
        this.noTareas = this.tareas.length === 0;
      },
      error: (err) => {
        console.error('Error al cargar tareas:', err);
        this.noTareas = true;
      },
    });
  }

  tareasPorEstado(estado: Tarea['estado']): Tarea[] {
    return this.tareas.filter(t => t.estado === estado);
  }

  crearTareaInline(): void {
    if (!this.proyectoId) {
      console.error('No se puede crear tarea: ID de proyecto no definido');
      return;
    }

    const nueva: Tarea = {
      nombre: '',
      estado: 'pendiente',
      proyecto_id: this.proyectoId
    };

    this.tareas.unshift(nueva);
    this.noTareas = false;
    this.tareaEnEdicion = nueva;

    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      this.nombreTareaInput?.nativeElement.focus();
    });
  }

  guardarTareaInline(tarea: Tarea): void {
    const nombre = tarea.nombre.trim();

    if (!nombre || nombre.length < 3) {
      alert('El nombre de la tarea debe tener al menos 3 caracteres.');
      this.tareas = this.tareas.filter(t => t !== tarea);
      this.tareaEnEdicion = null;
      this.noTareas = this.tareas.length === 0;
      return;
    }

    tarea.descripcion = tarea.descripcion?.trim() || '';

    const request$ = tarea.id
      ? this.http.put<Tarea>(`http://localhost:3003/api/tareas/${tarea.id}`, tarea)
      : this.http.post<Tarea>('http://localhost:3003/api/tareas', tarea);

    request$.subscribe({
      next: () => {
        this.cargarTareas();
        this.tareaEnEdicion = null;
      },
      error: (err) => {
        console.error(tarea.id ? 'Error al actualizar tarea' : 'Error al crear tarea', err);
        alert(tarea.id ? 'Error al actualizar la tarea' : 'Error al crear la tarea');
      }
    });
  }

  eliminarProyecto(): void {
    if (!confirm('¿Deseas eliminar este proyecto? Esta acción no se puede deshacer.')) return;

    this.proyectoService.eliminarProyecto(this.proyectoId).subscribe({
      next: () => {
        alert('Proyecto eliminado.');
        this.router.navigate(['/proyectos']);
      },
      error: (err) => console.error('Error al eliminar proyecto:', err),
    });
  }

  editarCampo(campo: keyof Proyecto): void {
    if (campo === 'progreso') return;

    this.editingField = campo;
    this.nuevoValor = String(this.proyecto[campo] || '');
  }

  guardarEdicion(): void {
    if (!this.nuevoValor.trim()) return;

    if (this.editingField && this.editingField !== 'progreso') {
      if (this.proyecto.hasOwnProperty(this.editingField)) {
        (this.proyecto[this.editingField] as any) = this.nuevoValor;
      }

      this.proyectoService.actualizarProyecto(this.proyectoId, this.proyecto).subscribe({
        next: () => (this.editingField = null),
        error: (err) => console.error('Error al actualizar el proyecto:', err),
      });
    }
  }

  cancelarEdicion(): void {
    this.editingField = null;
  }

  // === Participantes ===

  agregarParticipante(): void {
    const nombre = this.nuevoParticipante.trim();
    if (!nombre) return;

    this.participantes.push(nombre);
    this.nuevoParticipante = '';
  }

  eliminarParticipante(nombre: string): void {
    this.participantes = this.participantes.filter(p => p !== nombre);
  }

  // === DRAG & DROP ===

  dragOver(event: DragEvent): void {
    event.preventDefault();
  }

  dragStart(event: DragEvent, tarea: Tarea): void {
    event.dataTransfer?.setData('application/json', JSON.stringify({
      id: tarea.id,
      estado: tarea.estado
    }));
  }

  dragEnd(event: DragEvent): void {
    event.preventDefault();
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  drop(event: DragEvent, nuevoEstado: Tarea['estado']): void {
    event.preventDefault();
    const data = event.dataTransfer?.getData('application/json');
    if (!data) return;

    const { id } = JSON.parse(data);
    const tarea = this.tareas.find(t => t.id === id);
    if (!tarea || tarea.estado === nuevoEstado) return;

    const estadoAnterior = tarea.estado;
    tarea.estado = nuevoEstado;

    this.http.patch(`http://localhost:3003/api/tareas/${tarea.id}/estado`, { estado: nuevoEstado }).subscribe({
      next: () => this.cargarTareas(),
      error: (err) => {
        console.error('Error al cambiar el estado de la tarea:', err);
        tarea.estado = estadoAnterior;
      }
    });
  }

  // === TRACK BY ===

  trackById(index: number, tarea: Tarea): number {
    return tarea.id || index;
  }

  deseleccionarTarea(tarea: Tarea): void {
    const nombreActual = tarea.nombre?.trim() || '';

    if (!nombreActual) {
      this.tareas = this.tareas.filter(t => t !== tarea);
      this.noTareas = this.tareas.length === 0;
    } else if (nombreActual !== this.tareaNombreOriginal) {
      this.guardarTareaInline(tarea);
    }

    this.tareaEnEdicion = null;
    this.tareaNombreOriginal = null;
  }

  irADetalleTarea(tarea: Tarea): void {
    if (tarea.id) {
      this.router.navigate(['/tarea', tarea.id]);
    }
  }
}
