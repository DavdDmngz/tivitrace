import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  correo = '';
  contrasena = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  login() {
    this.http.post<any>('http://localhost:3003/api/auth/login', {
      correo: this.correo,
      contrasena: this.contrasena
    }).subscribe({
      next: (res) => {
        localStorage.setItem('jwt', res.token);
        this.toastr.success('¡Inicio de sesión exitoso!', 'Bienvenido');

        // ✅ Decodificar el token para obtener el ID y roles
        const decodedToken: any = jwtDecode(res.token);
        const roles: string[] = decodedToken.roles || [];
        const userId: string = decodedToken.id; // Obtener el ID del usuario del JWT

        // ✅ Redirigir según rol (ajusta según los nombres reales de tus rutas y roles)
        if (roles.includes('Administrador')) {
          this.router.navigate(['/admin/dashboard']);
        } else if (roles.includes('Supervisor')) {
          this.router.navigate(['/supervisor/dashboard']);
        } else {
          this.router.navigate([`/home`]);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Correo o contraseña incorrectos', 'Error de autenticación');
      }
    });
  }
}
