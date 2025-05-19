import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReporteService } from '../../../services/reporte.service';
import { HttpClientModule } from '@angular/common/http';
import Chart from 'chart.js/auto';

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

  resumen = {
    descripcion: 'Este panel presenta un resumen general del estado actual del sistema.',
    proyectosAsignados: 8,
    tareasPendientes: 14,
    entregasHoy: 3,
    progreso: 65
  };

  metas: string[] = [
    'Finalizar 3 proyectos estratégicos',
    'Aumentar progreso promedio a 80%',
    'Capacitar al equipo en nuevas herramientas'
  ];

  notificaciones: string[] = [
    'Se asignó una nueva tarea a Pedro',
    'El proyecto "Alpha" fue marcado como finalizado',
    'Actualización de roles completada'
  ];

  equipo: { nombre: string, rol: string }[] = [
    { nombre: 'Ana López', rol: 'Jefa de Proyecto' },
    { nombre: 'Carlos Rivera', rol: 'Backend' },
    { nombre: 'María Pérez', rol: 'Frontend' },
    { nombre: 'José Gómez', rol: 'QA' }
  ];

  proyectos: { nombre: string, progreso: number }[] = [];
  proyectoSeleccionado: { nombre: string, progreso: number } | null = null;

  usuariosPorEstado: any[] = [];
  proyectosPorFecha: any[] = [];
  tareasPorProyecto: any[] = [];
  usuariosConMasTareas: any[] = [];
  proyectosCercaFechaFin: any[] = [];
  promedioTiempoEjecucion: any = null;

  constructor(
    private authService: AuthService,
    private reporteService: ReporteService
  ) {}

  ngOnInit(): void {
    const roles = this.authService.getRoles();
    if (roles.length > 0) this.rol = roles[0];

    if (this.rol === 'administrador') {
      this.cargandoDashboard = true;
      this.reporteService.obtenerDashboard().subscribe({
        next: (data) => {
          this.dashboard = data;
          this.proyectos = data.proyectos || [];
          this.cargandoDashboard = false;
          this.inicializarGraficos();
        },
        error: (err) => {
          console.error('Error al cargar el dashboard, usando datos simulados:', err);
          this.dashboard = this.datosSimulados();
          this.proyectos = this.dashboard.proyectos || [];
          this.cargandoDashboard = false;
          this.inicializarGraficos();
        }
      });

      const fechaInicio = '2025-01-01';
      const fechaFin = '2025-12-31';

      this.reporteService.obtenerUsuariosPorEstado().subscribe({
        next: (data) => {
          this.usuariosPorEstado = data || [];
          this.inicializarGraficoUsuariosPorEstado();
        },
        error: (err) => console.error('Error al obtener usuarios por estado:', err)
      });

      this.reporteService.obtenerProyectosPorFecha(fechaInicio, fechaFin).subscribe({
        next: (data) => {
          this.proyectosPorFecha = data || [];
          this.inicializarGraficoProyectosPorFecha();
        },
        error: (err) => console.error('Error al obtener proyectos por fecha:', err)
      });

      this.reporteService.obtenerTareasPorProyecto().subscribe({
        next: (data) => {
          this.tareasPorProyecto = data || [];
          this.inicializarGraficoTareasPorProyecto();
        },
        error: (err) => console.error('Error al obtener tareas por proyecto:', err)
      });

      this.reporteService.obtenerUsuariosConMasTareas().subscribe({
        next: (data) => {
          this.usuariosConMasTareas = data || [];
          this.inicializarGraficoUsuariosConMasTareas();
        },
        error: (err) => console.error('Error al obtener usuarios con más tareas:', err)
      });

      this.reporteService.obtenerProyectosCercaFechaFin().subscribe({
        next: (data) => {
          this.proyectosCercaFechaFin = data || [];
        },
        error: (err) => console.error('Error al obtener proyectos cerca de la fecha de fin:', err)
      });

      this.reporteService.obtenerPromedioTiempoEjecucion().subscribe({
        next: (data) => {
          this.promedioTiempoEjecucion = data || null;
          this.inicializarGraficoPromedioTiempoEjecucion();
        },
        error: (err) => console.error('Error al obtener el promedio de tiempo de ejecución:', err)
      });
    }
  }

  datosSimulados() {
    return {
      usuariosPorRol: [
        { rol: { nombre: 'Administrador' }, usuarios: 5 },
        { rol: { nombre: 'Usuario' }, usuarios: 20 }
      ],
      totalUsuarios: 25,
      proyectosPorEstado: [
        { estado: 'en_proceso', cantidad: 8 },
        { estado: 'Finalizado', cantidad: 5 },
        { estado: 'Pendiente', cantidad: 3 }
      ],
      tareasPorEstado: [
        { estado: 'Completada', cantidad: 15 },
        { estado: 'En_proceso', cantidad: 10 },
        { estado: 'Pendiente', cantidad: 7 }
      ],
      progresoPromedio: 65,
      proyectos: [
        { nombre: 'Proyecto A', progreso: 80 },
        { nombre: 'Proyecto B', progreso: 60 },
        { nombre: 'Proyecto C', progreso: 90 }
      ]
    };
  }

  inicializarGraficos() {
    setTimeout(() => {
      if (!this.dashboard) return;

      const proyectosData = {
        labels: (this.dashboard.proyectosPorEstado || []).map((p: any) => p.estado),
        datasets: [{
          label: 'Proyectos',
          data: (this.dashboard.proyectosPorEstado || []).map((p: any) => p.cantidad),
          backgroundColor: ['#36a2eb', '#4bc0c0', '#ffcd56']
        }]
      };

      new Chart('proyectosChart', {
        type: 'bar',
        data: proyectosData,
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          }
        }
      });

      const tareasData = {
        labels: (this.dashboard.tareasPorEstado || []).map((t: any) => t.estado),
        datasets: [{
          label: 'Tareas',
          data: (this.dashboard.tareasPorEstado || []).map((t: any) => t.cantidad),
          backgroundColor: ['#ff6384', '#36a2eb', '#9966ff']
        }]
      };

      new Chart('tareasChart', {
        type: 'pie',
        data: tareasData,
        options: { responsive: true }
      });

      const progresoProyectosData = {
        labels: (this.proyectos || []).map((p: any) => p.nombre),
        datasets: [{
          label: 'Progreso (%)',
          data: (this.proyectos || []).map((p: any) => p.progreso),
          backgroundColor: '#4bc0c0'
        }]
      };

      new Chart('progresoProyectosChart', {
        type: 'bar',
        data: progresoProyectosData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: { display: true, text: 'Porcentaje' }
            }
          }
        }
      });
    }, 200);
  }

  inicializarGraficoUsuariosPorEstado() {
    setTimeout(() => {
      const data = {
        labels: (this.usuariosPorEstado || []).map(u => u.estado),
        datasets: [{
          label: 'Usuarios por Estado',
          data: (this.usuariosPorEstado || []).map(u => u.cantidad),
          backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe']
        }]
      };

      new Chart('usuariosPorEstadoChart', {
        type: 'doughnut',
        data: data,
        options: { responsive: true }
      });
    }, 200);
  }

  inicializarGraficoProyectosPorFecha() {
    setTimeout(() => {
      const data = {
        labels: (this.proyectosPorFecha || []).map(p => p.fecha),
        datasets: [{
          label: 'Proyectos por Fecha',
          data: (this.proyectosPorFecha || []).map(p => p.cantidad),
          backgroundColor: '#ffcd56'
        }]
      };

      new Chart('proyectosPorFechaChart', {
        type: 'line',
        data: data,
        options: { responsive: true }
      });
    }, 200);
  }

  inicializarGraficoTareasPorProyecto() {
    setTimeout(() => {
      if (this.tareasPorProyecto && this.tareasPorProyecto.length > 0) {
        const data = {
          labels: this.tareasPorProyecto.map(t => `Proyecto ${t.proyecto_id}`),
          datasets: [{
            label: 'Tareas por Proyecto',
            data: this.tareasPorProyecto.map(t => t.cantidad),
            backgroundColor: '#36a2eb'
          }]
        };

        new Chart('tareasPorProyectoChart', {
          type: 'bar',
          data: data,
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      } else {
        console.error("No se han recibido datos válidos para el gráfico de tareas.");
      }
    }, 200);
  }

  inicializarGraficoPromedioTiempoEjecucion() {
    setTimeout(() => {
      const promedio = parseFloat(this.promedioTiempoEjecucion?.promedio || 0);
  
      const data = {
        labels: ['Promedio Tiempo de Ejecución'],
        datasets: [{
          label: 'Tiempo (horas)',
          data: [promedio],
          backgroundColor: '#ff6384'
        }]
      };
  
      new Chart('promedioTiempoEjecucionChart', {
        type: 'doughnut',
        data: data,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Horas' }
            }
          }
        }
      });
    }, 200);
  }
  

  inicializarGraficoUsuariosConMasTareas() {
    setTimeout(() => {
      if (this.usuariosConMasTareas && this.usuariosConMasTareas.length > 0) {
        const data = {
          labels: this.usuariosConMasTareas.map(u => u.nombre_completo),
          datasets: [{
            label: 'Tareas Asignadas',
            data: this.usuariosConMasTareas.map(u => u.cantidad_tareas),
            backgroundColor: '#9966ff'
          }]
        };
  
        new Chart('usuariosConMasTareasChart', {
          type: 'bar',
          data: data,
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: { display: true, text: 'Cantidad de Tareas' }
              }
            }
          }
        });
      } else {
        console.warn("No se encontraron usuarios con tareas para graficar.");
      }
    }, 200);
  }  
}
