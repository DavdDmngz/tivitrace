import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

export function roleGuard(rolesPermitidos: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const roles = authService.getRoles();  // Obtiene el/los roles del token

    if (!roles || roles.length === 0) {
      router.navigate(['/no-token']);
      return of(false);
    }

    const tieneAcceso = roles.some((rol: string) =>
      rolesPermitidos.includes(rol.toLowerCase())
    );

    if (!tieneAcceso) {
      router.navigate(['/no-access']);
    }

    return of(tieneAcceso);
  };
}
