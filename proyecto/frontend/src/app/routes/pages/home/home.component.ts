import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReporteService } from '../../../services/reporte.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements OnInit {
  rol: string | null = null;
  dashboard: any = null;
  cargandoDashboard = false;

  constructor(
    private authService: AuthService,
    private reporteService: ReporteService
  ) {}

  ngOnInit(): void {
    const roles = this.authService.getRoles();
    if (roles.length > 0) {
      this.rol = roles[0];
    }

    // Solo si es administrador, cargamos el dashboard
    if (this.rol === 'administrador') {
      this.cargandoDashboard = true;
      this.reporteService.obtenerDashboard().subscribe({
        next: (data) => {
          this.dashboard = data;
          this.cargandoDashboard = false;
        },
        error: (err) => {
          console.error('Error al cargar el dashboard:', err);
          this.cargandoDashboard = false;
        }
      });
    }
  }
}
