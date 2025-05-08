import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, EMPTY, throwError } from 'rxjs';
import { catchError, switchMap, retryWhen, delay, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();
  
  console.log("Interceptor: Token encontrado: ", token); // Ver el token

  if (req.url.includes('/login') || req.url.includes('/refresh')) {
    console.log("Interceptor: Ignorando login o refresh URL");
    return next(req);
  }

  const addAuthHeader = (tokenValue: string | null) => {
    if (!tokenValue) return req;
    console.log("Interceptor: Agregando encabezado de autorización con el token:", tokenValue);
    return req.clone({ setHeaders: { Authorization: `Bearer ${tokenValue}` } });
  };

  const processRequest = (tokenValue: string | null) => next(addAuthHeader(tokenValue));

  if (!token) {
    console.log("Interceptor: No hay token, procesando sin token");
    return processRequest(null);
  }

  if (authService.isTokenExpired()) {
    console.log("Interceptor: Token expirado, intentando refrescar...");
    return authService.refreshToken().pipe(
      switchMap(success => {
        if (success) {
          const newToken = authService.getToken();
          console.log("Interceptor: Token renovado, reintentando solicitud con el nuevo token");
          return processRequest(newToken); 
        } else {
          console.log("Interceptor: Fallo en la renovación del token");
          authService.logout();
          router.navigate(['/login']);
          return EMPTY;
        }
      }),
      catchError(() => {
        console.log("Interceptor: Error en el proceso de renovación de token");
        authService.logout();
        router.navigate(['/login']);
        return EMPTY;
      })
    );
  }

  return processRequest(token).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log("Interceptor: Error HTTP 401 detectado");
      if (error.status === 401) {
        console.log("Interceptor: Intentando refrescar el token...");
        return authService.refreshToken().pipe(
          switchMap(success => {
            if (success) {
              const newToken = authService.getToken();
              console.log("Interceptor: Token renovado, reintentando solicitud");
              return processRequest(newToken); // Reintentar la solicitud original con el nuevo token
            } else {
              console.log("Interceptor: Fallo en la renovación del token");
              authService.logout();
              router.navigate(['/login']);
              return EMPTY; // No continuar con la solicitud
            }
          }),
          catchError(() => {
            console.log("Interceptor: Error en el proceso de renovación de token");
            authService.logout();
            router.navigate(['/login']);
            return EMPTY; // No continuar con la solicitud si el refresh token también falla
          })
        );
      }

      return throwError(() => error);
    })
  );
}

