import { Routes } from '@angular/router';
import { LoginComponent } from './routes/pages/login/login.component';
import { RegistroComponent } from './routes/pages/registro/registro.component';
import { RecuperarContrasenaComponent } from './routes/pages/forgot_password/forgot-password.component';
import { HomeComponent } from './routes/pages/home/home.component';
import { PerfilUsuarioComponent } from './routes/pages/perfil-usuario/perfil-usuario.component';
import { MainLayoutComponent } from './layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard';
import { roleGuard } from './guards/role.guard';
import { UsuarioComponent } from './routes/admin/usuarios/usuarios.component';
import { ProyectoComponent } from './routes/admin/proyectos/proyecto.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [PublicGuard],
    title: 'Iniciar Sesión',
  },
  {
    path: 'registro',
    component: RegistroComponent,
    canActivate: [PublicGuard],
    title: 'Crear Cuenta',
  },
  {
    path: 'recuperar-contrasena',
    component: RecuperarContrasenaComponent,
    canActivate: [PublicGuard],
    title: 'Recuperar Contraseña',
  },

  // Rutas privadas
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent,
        title: 'Inicio',
      },
      {
        path: 'profile/:id',
        component: PerfilUsuarioComponent,
        title: 'Mi Perfil',
      },
      {
        path: 'admin/usuarios',
        canActivate: [roleGuard(['administrador'])],
        title: 'Gestión de Usuarios',
        children: [
          { path: '', redirectTo: 'listar', pathMatch: 'full' },
          { path: 'listar', component: UsuarioComponent, title: 'Lista de Usuarios' },
          { path: 'crear', component: UsuarioComponent, title: 'Crear Usuario' },  // Cambié a UsuarioComponent
          { path: 'editar/:id', component: UsuarioComponent, title: 'Editar Usuario' } // Agregué la ruta para editar
        ]
      },
      {
        path: 'admin/proyectos',
        component: ProyectoComponent,
        canActivate: [roleGuard(['administrador'])],
        title: 'Proyectos'
      }
      
    ]
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
