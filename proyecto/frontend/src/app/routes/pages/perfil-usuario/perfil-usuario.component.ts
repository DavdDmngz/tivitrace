import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';  // Importa AuthService

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.component.html',
  standalone: true,
  imports: [FormsModule]
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

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private authService: AuthService  // Inyecta AuthService
  ) {}

  ngOnInit() {
    // Obtener el ID de la URL
    this.usuarioId = this.route.snapshot.paramMap.get('id')!;
    console.log('ID del usuario:', this.usuarioId);

    // Cargar datos del usuario
    this.cargarDatosUsuario();

    // Cargar el rol desde el token
    this.obtenerRolDesdeJWT();
  }

  cargarDatosUsuario() {
    this.http.get(`http://localhost:3003/api/usuarios/${this.usuarioId}`).subscribe({
      next: (data: any) => {
        this.usuario.nombre = data.nombre;
        this.usuario.apellido = data.apellido;
        this.usuario.correo = data.correo;
        this.usuario.codigo_pais = data.codigo_pais;
        this.usuario.telefono = data.telefono;
        this.usuario.imagenUrl = data.imagenUrl
          ? `http://localhost:3003/img/usuarios/${data.imagenUrl}`
          : `http://localhost:3003/img/usuarios/default.jpg`;
      },
      error: () => {
        this.toastr.error('Error al cargar los datos del usuario');
      }
    });
  }
  

  obtenerRolDesdeJWT() {
    const roles = this.authService.getRoles();  // Utiliza el AuthService para obtener los roles

    if (roles && roles.length > 0) {
      this.usuario.rol = roles[0];  // Asume que solo hay un rol
    } else {
      this.usuario.rol = 'Sin rol';
    }

    console.log('Rol extraído del JWT:', this.usuario.rol);
  }

  guardarCambios() {
    const datosActualizados = {
      nombre: this.usuario.nombre,
      apellido: this.usuario.apellido,
      correo: this.usuario.correo,
      telefono: this.usuario.telefono
    };
  
    this.http.put(`http://localhost:3003/api/usuarios/${this.usuarioId}`, datosActualizados).subscribe({
      next: () => {
        this.toastr.success('¡Datos guardados con éxito!');
        window.location.reload();
      },
      error: () => {
        this.toastr.error('Error al guardar los datos');
      }
    });
  }  

  seleccionarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
  
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Solo se permiten imágenes');
        return;
      }
  
      this.imagenSeleccionada = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.usuario.imagenUrl = e.target.result;
      };
      reader.readAsDataURL(this.imagenSeleccionada);
    }
  }

  subirFoto() {
    if (this.imagenSeleccionada) {
      const formData = new FormData();
      formData.append('img', this.imagenSeleccionada);

      this.http.post<any>(`http://localhost:3003/api/usuarios/${this.usuarioId}/img`, formData).subscribe({
        next: (response) => {
          if (response.imagenUrl) {
            this.usuario.imagenUrl = `http://localhost:3003/img/usuarios/${response.imagenUrl}?${new Date().getTime()}`;
            this.toastr.success('Foto de perfil actualizada');
          } else {
            this.toastr.error('No se pudo actualizar la imagen');
          }
        },
        error: () => {
          this.toastr.error('Error al subir la foto');
        }
      });
    } else {
      this.toastr.warning('No se ha seleccionado ninguna imagen');
    }
  }

  cambiarContrasena() {
    if (this.formularioContrasena.nueva !== this.formularioContrasena.confirmar) {
      this.toastr.error('Las contraseñas no coinciden');
      return;
    }

    this.http.put(`http://localhost:3003/api/usuarios/${this.usuarioId}/cambiar-contrasena`, {
      actual: this.formularioContrasena.actual,
      nueva: this.formularioContrasena.nueva,
    }).subscribe({
      next: () => {
        this.toastr.success('¡Contraseña cambiada con éxito!');
      },
      error: () => {
        this.toastr.error('Error al cambiar la contraseña');
      }
    });
  }
}
