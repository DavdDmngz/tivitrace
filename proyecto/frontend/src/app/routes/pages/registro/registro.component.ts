import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // 👈 importa esto
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  standalone: true,
  imports: [FormsModule,RouterModule, HttpClientModule,], // 👈 agrégalo aquí
})
export class RegistroComponent {
  nombre = '';
  apellido = '';
  correo = '';
  contrasena = '';
  confirmarContrasena = '';
  codigo_pais = '';
  telefono = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  registrar() {
    if (this.contrasena !== this.confirmarContrasena) {
      this.toastr.error('Las contraseñas no coinciden');
      return;
    }

    this.http.post('http://localhost:3003/api/usuarios', {
      nombre: this.nombre,
      apellido: this.apellido,
      correo: this.correo,
      contrasena: this.contrasena,
      codigo_pais: this.codigo_pais,
      telefono: this.telefono
    }).subscribe({
      next: () => {
        this.toastr.success('Cuenta creada con éxito');
        this.router.navigate(['/login']);
      },error: (error) => {
        if (error.error?.errores) {
          error.error.errores.forEach((err: { campo: string; mensaje: string }) => {
            this.toastr.error(err.mensaje, `Error en ${err.campo}`);
          });
        } else {
          this.toastr.error(error.error?.mensaje || 'Error al registrar');
        }
      }      
    });
  }
}
