import { ApplicationConfig, inject } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

// ✅ Función para obtener el access token y refresh token
function getAccessToken() {
  return localStorage.getItem('jwt');
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

// ✅ Verifica si el token está expirado
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch {
    return true;
  }
}

// ✅ Interceptor JWT con refresh automático
export const jwtInterceptor = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const token = getAccessToken();
  const http = inject(HttpClient); // Inyectamos HttpClient manualmente

  console.log('➡️ Interceptando solicitud:', req.url);

  if (req.url.includes('/login') || req.url.includes('/refresh')) {
    console.log('⏭️ Saltando interceptación para:', req.url);
    return next(req);
  }

  // 🔁 Función para refrescar el token
  const refreshAndRetry = () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.error('❌ No hay refresh token disponible');
      return throwError(() => new Error('No refresh token'));
    }

    return http.post<any>('http://localhost:3003/api/auth/refresh', { refreshToken }).pipe(
      switchMap(res => {
        console.log('✅ Token refrescado:', res.accessToken);
        localStorage.setItem('jwt', res.accessToken);

        const retryReq = req.clone({
          setHeaders: { Authorization: `Bearer ${res.accessToken}` }
        });

        return next(retryReq);
      }),
      catchError(refreshError => {
        console.error('❌ Error al refrescar el token:', refreshError);
        return throwError(() => refreshError);
      })
    );
  };

  // ✅ Si hay token y está expirado, refrescar primero
  if (token && isTokenExpired(token)) {
    console.warn('🔒 Token expirado detectado antes de la solicitud. Refrescando...');
    return refreshAndRetry();
  }

  // Si el token está bien, clonar la solicitud y seguir
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('⚠️ Solicitud 401. Intentando refresh desde catchError...');
        return refreshAndRetry();
      }
      return throwError(() => error);
    })
  );
};

// ✅ Configuración de la app
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    )
  ]
};
