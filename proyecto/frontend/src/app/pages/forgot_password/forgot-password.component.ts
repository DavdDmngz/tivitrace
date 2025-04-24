import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // 👈 Importalo aquí
import { RouterModule, Router } from '@angular/router'; // 👈 Añadimos Router aquí

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  standalone: true,
  imports: [FormsModule, RouterModule, HttpClientModule, CommonModule], // 👈 Ya está RouterModule aquí
})
export class RecuperarContrasenaComponent {
  correo = '';
  codigo = '';
  nuevaContrasena = '';
  codigoEnviado = false;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router // 👈 Inyectamos el Router aquí
  ) {}

  solicitarCodigo() {
    this.http.post('http://localhost:3003/api/auth/recuperar-contrasena', { correo: this.correo })
      .subscribe({
        next: () => {
          this.toastr.success('Código enviado al correo');
          this.codigoEnviado = true;
        },
        error: (err) => {
          this.toastr.error(err.error?.mensaje || 'Error al solicitar el código');
        }
      });
  }

  cambiarContrasena() {
    const payload = {
      correo: this.correo,
      codigo: this.codigo,
      nuevaContrasena: this.nuevaContrasena
    };

    this.http.post('http://localhost:3003/api/auth/cambiar-contrasena', payload)
      .subscribe({
        next: () => {
          this.toastr.success('Contraseña actualizada correctamente');
          this.router.navigate(['/login']); // 👈 Redirigimos al login
        },
        error: (err) => {
          if (err.error?.errores) {
            err.error.errores.forEach((e: any) => this.toastr.error(e.mensaje, `Error en ${e.campo}`));
          } else {
            this.toastr.error(err.error?.mensaje || 'Error al cambiar contraseña');
          }
        }
      });
  }
}
