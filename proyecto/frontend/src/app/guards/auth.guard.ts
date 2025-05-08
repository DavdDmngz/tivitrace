import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    if (!this.authService.isLoggedIn()) {
      return of(this.router.parseUrl('/login'));
    }

    if (!this.authService.isTokenExpired()) {
      return of(true);
    }

    // Token expirado, intentar refresh
    return this.authService.refreshToken().pipe(
      switchMap(success => {
        if (success) return of(true);
        this.authService.logout(); // limpiar storage
        return of(this.router.parseUrl('/login'));
      }),
      catchError(() => {
        this.authService.logout();
        return of(this.router.parseUrl('/login'));
      })
    );
  }
}
