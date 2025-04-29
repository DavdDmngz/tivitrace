// topbar.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Ajusta la ruta si es necesario
import { Router, RouterModule } from '@angular/router'; // Importa RouterModule aquí
import { HttpClient } from '@angular/common/http'; // Asegúrate de importar HttpClient

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './topbar.component.html'
})
export class TopbarComponent implements OnInit {
  usuario: any = {};  // Almacena los datos del usuario (nombre, etc.)
  usuarioId: string | null = '';  // Almacena el ID del usuario

  constructor(
    private authService: AuthService,  // Servicio de autenticación
    private router: Router,  // Router de Angular para navegación
    private http: HttpClient  // Asegúrate de inyectar HttpClient
  ) {}

  ngOnInit(): void {
    // Obtener nombre del usuario desde el servicio
    const nombre = this.authService.getNombreUsuario();
    this.usuario = { nombre: nombre || 'Invitado' };

    // Obtener el ID del usuario desde el servicio
    this.usuarioId = this.authService.getUsuarioId();

    // Cargar la imagen del usuario
    this.cargarImagenUsuario();
  }

  // Método para cerrar sesión
  logout(): void {
    this.authService.logout();  // Cerrar sesión
    this.router.navigate(['/login']);  // Redirigir al login
  }

  // Método para cargar la imagen del usuario
  cargarImagenUsuario() {
    if (this.usuarioId) {
      this.http.get(`http://localhost:3003/api/usuarios/${this.usuarioId}`).subscribe({
        next: (data: any) => {
          // Verifica si existe la imagen y asigna la URL correcta
          this.usuario.imagenUrl = data.imagenUrl
            ? `http://localhost:3003/img/usuarios/${data.imagenUrl}`  // Usa la ruta con el nombre de archivo guardado
            : `http://localhost:3003/img/usuarios/default.jpg`; // Usa una imagen por defecto
        },
        error: () => {
          // Si hay un error, no mostramos nada (sin toastr)
          console.error('Error al cargar la imagen del usuario');
        }
      });
    }
  }
}
