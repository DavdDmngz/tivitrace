import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { RecuperarContrasenaComponent } from './pages/forgot_password/forgot-password.component';
import { HomeComponent } from './pages/home/home.component';
import { PerfilUsuarioComponent } from './pages/perfil-usuario/perfil-usuario.component';
import { MainLayoutComponent } from './layout/layout.component';
import { AuthGuard } from './guards/auth.guard';
import { PublicGuard } from './guards/public.guard';


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
      }      
    ]
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];