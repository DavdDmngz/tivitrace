import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { RecuperarContrasenaComponent } from './pages/forgot_password/forgot-password.component';
import { HomeComponent } from './pages/home/home.component';
import { MainLayoutComponent } from './layout/layout.component'

export const routes: Routes = [
  // Rutas públicas (sin topbar)
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar Sesión',
  },
  {
    path: 'registro',
    component: RegistroComponent,
    title: 'Crear Cuenta',
  },
  {
    path: 'recuperar-contrasena',
    component: RecuperarContrasenaComponent,
    title: 'Recuperar Contraseña',
  },

  // Rutas con layout que incluye el Topbar
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
        title: 'Inicio',
      },
    ]
  },

  // Redirecciones
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
