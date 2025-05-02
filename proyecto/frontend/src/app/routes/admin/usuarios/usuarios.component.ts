import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './usuarios.component.html'
})
export class UsuarioComponent {
  @Input() usuarios: any[] = [];
  @Output() usuarioEditado = new EventEmitter<any>();

  // Variables para el modo y formulario
  modo: 'listar' | 'crear' | 'editar' = 'listar';

  nombre = '';
  apellido = '';
  correo = '';
  contrasena = '';
  confirmarContrasena = '';
  codigo_pais = '';
  telefono = '';
  rol = '';

  apiUrl = 'http://localhost:3003/api/usuarios';
  usuarioId: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.detectarRuta();
    this.route.url.subscribe(() => this.detectarRuta());

    if (this.modo === 'listar') {
      this.cargarUsuarios();
    } else if (this.modo === 'editar') {
      this.cargarDatosUsuarioParaEdicion();
    }
  }

  detectarRuta() {
    const url = this.router.url;
    if (url.includes('crear')) {
      this.modo = 'crear';
    } else if (url.includes('editar')) {
      this.modo = 'editar';
      // Extraemos el ID del usuario para la edición
      const urlParts = url.split('/');
      this.usuarioId = urlParts[urlParts.length - 1]; 
    } else {
      this.modo = 'listar';
    }
  }

  cargarUsuarios() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: data => this.usuarios = data,
      error: err => console.error('Error al cargar usuarios:', err)
    });
  }

  cargarDatosUsuarioParaEdicion() {
    if (this.usuarioId) {
      this.http.get(`${this.apiUrl}/${this.usuarioId}`).subscribe({
        next: (usuario: any) => {
          this.nombre = usuario.nombre;
          this.apellido = usuario.apellido;
          this.correo = usuario.correo;
          this.codigo_pais = usuario.codigo_pais;
          this.telefono = usuario.telefono;
          this.rol = usuario.rol;
        },
        error: err => {
          console.error('Error al cargar el usuario:', err);
          alert('Error al cargar los datos del usuario para editar');
        }
      });
    }
  }

  editarUsuario(usuario: any) {
    this.usuarioEditado.emit(usuario);
  }

  eliminarUsuario(usuario: any) {
    if (confirm(`¿Estás seguro de eliminar a ${usuario.nombre} ${usuario.apellido}?`)) {
      this.http.delete(`${this.apiUrl}/${usuario.id}`).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
          alert('Usuario eliminado correctamente');
        },
        error: err => {
          console.error(err);
          alert('Error al eliminar el usuario');
        }
      });
    }
  }

  registrar() {
    if (this.contrasena !== this.confirmarContrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }

    this.http.post(this.apiUrl, {
      nombre: this.nombre,
      apellido: this.apellido,
      correo: this.correo,
      contrasena: this.contrasena,
      codigo_pais: this.codigo_pais,
      telefono: this.telefono,
      rol: this.rol
    }).subscribe({
      next: () => {
        alert('Cuenta creada con éxito');
        this.router.navigate(['/admin/usuarios']);
      },
      error: (error) => {
        console.error(error);
        alert(error.error?.mensaje || 'Error al registrar');
      }
    });
  }

  actualizar() {
    if (this.contrasena !== this.confirmarContrasena) {
      alert('Las contraseñas no coinciden');
      return;
    }

    this.http.put(`${this.apiUrl}/${this.usuarioId}`, {
      nombre: this.nombre,
      apellido: this.apellido,
      correo: this.correo,
      contrasena: this.contrasena,
      codigo_pais: this.codigo_pais,
      telefono: this.telefono,
      rol: this.rol
    }).subscribe({
      next: () => {
        alert('Usuario actualizado con éxito');
        this.router.navigate(['/admin/usuarios']);
      },
      error: (error) => {
        console.error(error);
        alert(error.error?.mensaje || 'Error al actualizar');
      }
    });
  }
}
