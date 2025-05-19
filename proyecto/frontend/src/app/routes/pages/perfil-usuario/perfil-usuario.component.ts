import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class PerfilUsuarioComponent implements OnInit {

  usuario = {
    nombre: '',
    apellido: '',
    correo: '',
    codigo_pais: '',
    telefono: '',
    imagenUrl: '',
    rol: ''
  };

  formularioContrasena = {
    actual: '',
    nueva: '',
    confirmar: ''
  };

  imagenSeleccionada: File | null = null;
  usuarioId: string = '';

  roles: string[] = [];

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.usuarioId = id;
      console.log('ID del usuario:', this.usuarioId);

      this.roles = this.authService.getRoles();
      this.cargarDatosUsuario();
    } else {
      this.toastr.error('No se encontró el ID del usuario');
    }
  }

  cargarDatosUsuario(): void {
    this.http.get<any>(`http://localhost:3003/api/usuarios/${this.usuarioId}`).subscribe({
      next: (data) => {
        this.usuario = {
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          correo: data.correo || '',
          codigo_pais: data.codigo_pais || '',
          telefono: data.telefono || '',
          rol: data.rol || 'Sin rol',
          imagenUrl: data.imagenUrl
            ? `http://localhost:3003/img/usuarios/${data.imagenUrl}`
            : `http://localhost:3003/img/usuarios/default.jpg`
        };

        console.log('Datos del usuario cargados:', this.usuario);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al cargar los datos del usuario');
      }
    });
  }

  guardarCambios(): void {
    const { nombre, apellido, correo, telefono, rol } = this.usuario;

    const datosActualizados = { nombre, apellido, correo, telefono, rol };

    this.http.put(`http://localhost:3003/api/usuarios/${this.usuarioId}`, datosActualizados).subscribe({
      next: () => {
        this.toastr.success('¡Datos guardados con éxito!');
        window.location.reload(); // ❗ Considera evitar recargar toda la página si no es necesario
      },
      error: () => {
        this.toastr.error('Error al guardar los datos');
      }
    });
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.toastr.error('Solo se permiten imágenes');
        return;
      }

      this.imagenSeleccionada = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.usuario.imagenUrl = (e.target as FileReader).result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  subirFoto(): void {
    if (!this.imagenSeleccionada) {
      this.toastr.warning('No se ha seleccionado ninguna imagen');
      return;
    }

    const formData = new FormData();
    formData.append('img', this.imagenSeleccionada);

    this.http.post<any>(`http://localhost:3003/api/usuarios/${this.usuarioId}/img`, formData).subscribe({
      next: (response) => {
        if (response.imagenUrl) {
          this.usuario.imagenUrl = `http://localhost:3003/img/usuarios/${response.imagenUrl}?${Date.now()}`;
          this.toastr.success('Foto de perfil actualizada');
        } else {
          this.toastr.error('No se pudo actualizar la imagen');
        }
      },
      error: () => {
        this.toastr.error('Error al subir la foto');
      }
    });
  }

  cambiarContrasena(): void {
    const { actual, nueva, confirmar } = this.formularioContrasena;

    if (!actual || !nueva || !confirmar) {
      this.toastr.warning('Todos los campos son obligatorios');
      return;
    }

    if (nueva !== confirmar) {
      this.toastr.error('Las contraseñas no coinciden');
      return;
    }

    this.http.put(`http://localhost:3003/api/usuarios/${this.usuarioId}/cambiar-contrasena`, {
      actual,
      nueva
    }).subscribe({
      next: () => {
        this.toastr.success('¡Contraseña cambiada con éxito!');
        this.formularioContrasena = { actual: '', nueva: '', confirmar: '' }; // limpiar
      },
      error: () => {
        this.toastr.error('Error al cambiar la contraseña');
      }
    });
  }
}
