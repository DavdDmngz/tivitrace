import {
  Component, OnInit
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';

interface Tarea {
  id: number;
  nombre: string;
  descripcion?: string;
  estado: 'sin_comenzar' | 'en_proceso' | 'pendiente' | 'finalizado';
  adjuntos?: { id: number; nombre_archivo: string; url: string }[];
  proyecto_id: number;
  fecha_fin: Date;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

interface Participante {
  id: number;
  usuario: Usuario;
  proyecto_id: number;
  tarea_id: number;
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

  participantes: Participante[] = [];
  nuevoParticipante: string = '';
  archivosAdjuntos: File[] = [];

  usuariosFiltrados: Usuario[] = [];
  usuarioSeleccionado?: Usuario;
  esAdministrador: boolean = false;

  estados: Tarea['estado'][] = ['sin_comenzar', 'en_proceso', 'pendiente', 'finalizado'];

  constructor(
    private location: Location,
    private authservice: AuthService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarRol();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || isNaN(+idParam)) {
      console.error('ID de tarea inválido');
      this.router.navigate(['/proyectos']);
      return;
    }

    this.tareaId = +idParam;

    this.http.get<Tarea>(`http://localhost:3003/api/tareas/${this.tareaId}`).subscribe({
      next: (tarea) => {
        this.tarea = tarea;
        this.cargarParticipantes();
        this.cargarAdjuntos();
      },
      error: (error) => {
        console.error('Error al cargar la tarea', error);
      }
    });
  }

  volver() {
    this.location.back();
  }

  verificarRol(): void {
    this.esAdministrador = this.authservice.hasRole('administrador');
  }

  cargarParticipantes(): void {
    this.http.get<Participante[]>(`http://localhost:3003/api/participantes?tarea_id=${this.tareaId}`).subscribe({
      next: (data) => {
        this.participantes = data;
      },
      error: (err) => {
        console.error('Error al cargar participantes:', err);
      }
    });
  }

  cargarAdjuntos(): void {
    this.http.get<Tarea['adjuntos']>(`http://localhost:3003/api/tareas/${this.tareaId}/adjuntos`).subscribe({
      next: (adjuntos) => {
        this.tarea.adjuntos = adjuntos ?? [];
      },
      error: (err) => {
        console.error('Error al cargar adjuntos:', err);
        this.tarea.adjuntos = [];
      }
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
        const nuevoParticipante: Participante = {
          id: this.usuarioSeleccionado?.id ?? 0,
          usuario: this.usuarioSeleccionado!,
          proyecto_id: this.tarea.proyecto_id,
          tarea_id: this.tarea.id
        };
        this.participantes.push(nuevoParticipante);
        this.usuarioSeleccionado = undefined;
        this.nuevoParticipante = '';
      },
      error: (err) => console.error('Error al agregar participante:', err)
    });
  }

  eliminarParticipante(participante: Participante): void {
    const confirmar = confirm(`¿Estás seguro de eliminar al participante ${participante.usuario.nombre} ${participante.usuario.apellido}?`);
    if (!confirmar) return;

    this.http.delete(`http://localhost:3003/api/participantes/${participante.id}`).subscribe({
      next: () => {
        this.participantes = this.participantes.filter(p => p.id !== participante.id);
        alert('Participante eliminado exitosamente.');
      },
      error: (err) => {
        console.error('Error al eliminar participante:', err);
        alert('No se pudo eliminar el participante.');
      }
    });
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

  subirAdjuntos(): void {
    if (this.archivosAdjuntos.length === 0) {
      alert('No hay archivos seleccionados para subir.');
      return;
    }

    const formData = new FormData();
    this.archivosAdjuntos.forEach((archivo) => {
      formData.append('file', archivo);
    });

    this.http.post(`http://localhost:3003/api/tareas/${this.tareaId}/adjuntos`, formData).subscribe({
      next: () => {
        alert('Archivo(s) subido(s) correctamente.');
        this.archivosAdjuntos = [];
        this.cargarAdjuntos();
      },
      error: (err) => {
        console.error('Error al subir archivos:', err);
        alert('Error al subir archivos.');
      }
    });
  }

  finalizarTarea(): void {
    if (this.tarea.estado === 'finalizado') {
      alert('La tarea ya está finalizada.');
      return;
    }
  
    const estadoAnterior = this.tarea.estado;
    this.tarea.estado = 'finalizado';
  
    this.http.patch(`http://localhost:3003/api/tareas/${this.tarea.id}/estado`, { estado: 'finalizado' }).subscribe({
      next: (respuesta: any) => {
        if (respuesta?.tarea?.estado === 'finalizado') {
          alert('Tarea finalizada correctamente.');
        } else {
          alert('No se pudo finalizar la tarea.');
          this.tarea.estado = estadoAnterior;
        }
      },
      error: (err) => {
        console.error('Error al finalizar la tarea:', err);
        this.tarea.estado = estadoAnterior;
        alert('Error al finalizar la tarea.');
      }
    });
  }
  
  enviarTarea(): void {
    this.tarea.estado = 'pendiente';
    this.guardarCambios();
  }
  tareaEnProceso(): void {
    this.tarea.estado = 'en_proceso';
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

  eliminarAdjunto(adjunto: { id: number; nombre_archivo: string }, index: number): void {
    const confirmar = confirm(`¿Deseas eliminar el archivo "${adjunto.nombre_archivo}"?`);
    if (!confirmar) return;

    this.http.delete(`http://localhost:3003/api/adjuntos/${adjunto.id}`).subscribe({
      next: () => {
        this.tarea.adjuntos?.splice(index, 1);
        alert('Archivo eliminado correctamente.');
      },
      error: (err) => {
        console.error('Error al eliminar adjunto:', err);
        alert('No se pudo eliminar el archivo.');
      }
    });
  }

  descargarArchivo(adjunto: { url: string; nombre_archivo: string }): void {
    const a = document.createElement('a');
    a.href = adjunto.url;
    a.download = adjunto.nombre_archivo;
    a.click();
  }
}
