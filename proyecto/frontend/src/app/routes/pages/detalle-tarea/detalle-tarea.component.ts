import {
  Component, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Tarea {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: 'pendiente' | 'en progreso' | 'finalizado';
  proyecto_id: number;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

@Component({
  selector: 'app-detalle-tarea',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detalle-tarea.component.html',
})
export class DetalleTareaComponent implements OnInit {
  tareaId!: number;
  tarea!: Tarea;

  participantes: string[] = [];
  nuevoParticipante: string = '';
  archivosAdjuntos: File[] = [];

  usuariosFiltrados: Usuario[] = [];
  usuarioSeleccionado?: Usuario;

  estados: Tarea['estado'][] = ['pendiente', 'en progreso', 'finalizado'];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || isNaN(+idParam)) {
      console.error('ID de tarea inválido');
      this.router.navigate(['/proyectos']);
      return;
    }

    this.tareaId = +idParam;
    this.cargarTarea();
  }

  cargarTarea(): void {
    this.http.get<Tarea>(`http://localhost:3003/api/tareas/${this.tareaId}`).subscribe({
      next: (data) => {
        this.tarea = data;
      },
      error: (err) => {
        console.error('Error al cargar la tarea:', err);
        this.router.navigate(['/proyectos']);
      },
    });
  }

  guardarCambios(): void {
    this.http.put<Tarea>(`http://localhost:3003/api/tareas/${this.tareaId}`, this.tarea).subscribe({
      next: () => alert('Tarea actualizada con éxito.'),
      error: (err) => console.error('Error al actualizar tarea:', err),
    });
  }

  buscarUsuarios(): void {
    if (!this.nuevoParticipante.trim()) {
      this.usuariosFiltrados = [];
      return;
    }

    const query = this.nuevoParticipante.trim();

    this.http.get<Usuario[]>(`http://localhost:3003/api/usuarios?buscar=${encodeURIComponent(query)}`).subscribe({
      next: (data) => this.usuariosFiltrados = data,
      error: (err) => console.error('Error al buscar usuarios:', err)
    });
  }

  seleccionarUsuario(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.nuevoParticipante = `${usuario.nombre} ${usuario.apellido} (${usuario.correo})`;
    this.usuariosFiltrados = [];
  }

  agregarParticipante(): void {
    if (!this.usuarioSeleccionado) return;

    const payload = {
      usuario_id: this.usuarioSeleccionado.id,
      proyecto_id: this.tarea.proyecto_id,
      tarea_id: this.tarea.id
    };

    this.http.post(`http://localhost:3003/api/participantes`, payload).subscribe({
      next: () => {
        alert('Participante agregado exitosamente');
        this.participantes.push(`${this.usuarioSeleccionado!.nombre} ${this.usuarioSeleccionado!.apellido}`);
        this.usuarioSeleccionado = undefined;
        this.nuevoParticipante = '';
      },
      error: (err) => console.error('Error al agregar participante:', err)
    });
  }

  eliminarParticipante(nombre: string): void {
    this.participantes = this.participantes.filter(p => p !== nombre);
    // Realiza una petición para eliminar el participante en el backend también si es necesario
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivosAdjuntos.push(...Array.from(input.files));
    }
  }

  eliminarArchivo(index: number): void {
    this.archivosAdjuntos.splice(index, 1);
  }

  confirmarFinalizar(): void {
    const confirmado = confirm('¿Estás seguro de finalizar la tarea? Esta acción no se puede revertir.');
    if (confirmado) {
      this.finalizarTarea();
    }
  }

  finalizarTarea(): void {
    this.tarea.estado = 'finalizado';
    this.guardarCambios();
  }

  eliminarTarea(): void {
    const confirmado = confirm('¿Estás seguro de eliminar la tarea? Esta acción no se puede revertir.');
    if (confirmado) {
      this.http.delete(`http://localhost:3003/api/tareas/${this.tareaId}`).subscribe({
        next: () => {
          alert('Tarea eliminada con éxito.');
          this.router.navigate(['/proyectos']);
        },
        error: (err) => console.error('Error al eliminar tarea:', err),
      });
    }
  }
}
