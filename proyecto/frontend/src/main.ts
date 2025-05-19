import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { environment } from './app/environments/environment.component';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Formato de fecha y hora - i18n
// Importa el locale de Angular para español (es)
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es'; 

registerLocaleData(localeEs);

// i18n - ngx-translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // Aquí solo usamos provideHttpClient
import { jwtInterceptor } from './app/app.config';  // Importa el interceptor desde tu configuración
import { HttpClient } from '@angular/common/http'; // Importación del HttpClient

// Loader para archivos JSON de traducción
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    // Usamos `importProvidersFrom` para importar módulos y configuraciones
    importProvidersFrom(
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-bottom-right',
        preventDuplicates: true,
      }),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }),
      // Aquí configuramos el HttpClient correctamente
    ),
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    )
  ]
}).catch(err => console.error(err));
// .catch(err => console.error(err)); // Manejo de errores al iniciar la aplicación