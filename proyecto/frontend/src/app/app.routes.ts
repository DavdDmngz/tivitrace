import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    loadComponent: () => import('./routes/pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [PublicGuard],
    title: 'Iniciar Sesión',
  },
  {
    path: 'registro',
    loadComponent: () => import('./routes/pages/registro/registro.component').then(m => m.RegistroComponent),
    canActivate: [PublicGuard],
    title: 'Crear Cuenta',
  },
  {
    path: 'recuperar-contrasena',
    loadComponent: () => import('./routes/pages/forgot_password/forgot-password.component').then(m => m.RecuperarContrasenaComponent),
    canActivate: [PublicGuard],
    title: 'Recuperar Contraseña',
  },

  // Rutas privadas (autenticadas)
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./routes/pages/home/home.component').then(m => m.HomeComponent),
        title: 'Inicio',
      },
      {
        path: 'profile/:id',
        loadComponent: () => import('./routes/pages/perfil-usuario/perfil-usuario.component').then(m => m.PerfilUsuarioComponent),
        title: 'Mi Perfil',
      },
      {
        path: 'admin/usuarios',
        canActivate: [roleGuard(['administrador'])],
        title: 'Gestión de Usuarios',
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          {
            path: 'listar',
            loadComponent: () => import('./routes/admin/usuarios/usuarios.component').then(m => m.UsuarioComponent),
            title: 'Lista de Usuarios',
          },
          {
            path: 'crear',
            loadComponent: () => import('./routes/admin/usuarios/usuarios.component').then(m => m.UsuarioComponent),
            title: 'Crear Usuario',
          },
          {
            path: 'editar/:id',
            loadComponent: () => import('./routes/admin/usuarios/usuarios.component').then(m => m.UsuarioComponent),
            title: 'Editar Usuario',
          },
        ]
      },
      {
        path: 'proyectos',
        loadComponent: () => import('./routes/admin/proyectos/proyecto.component').then(m => m.ProyectoComponent),
        title: 'Proyectos'
      },
      {
        path: 'proyectos/:id',
        loadComponent: () => import('./routes/pages/proyecto-detalle/proyecto-detalle.component').then(m => m.DetalleProyectoComponent),
        title: 'Detalle del Proyecto'
      },
      {
        path: 'tarea/:id',
        loadComponent: () => import('./routes/pages/detalle-tarea/detalle-tarea.component').then(m => m.DetalleTareaComponent),
        title: 'Detalle de la Tarea'
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
