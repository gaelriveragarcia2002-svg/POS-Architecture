import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AUTH_PROVIDERS } from '@pos-architecture/auth';
import {
  API_CONFIG,
  CORE_PROVIDERS,
  authInterceptor,
} from '@pos-architecture/core';
import { environment } from '../environments/environment';
import { provideAppBootstrap } from './app.initializer';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // * Providers locales.
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    //* Restaura la sesión antes de que arranque la app.
    provideAppBootstrap(),

    // * Declaracion de providers gloabales.
    // La app es la única que conoce sus environments; la lib solo ve el token.
    // El fileReplacements de project.json intercambia el fichero por configuración.
    { provide: API_CONFIG, useValue: environment },

    // * Providers para tokens y autenticacion en todas las apps.
    ...CORE_PROVIDERS,
    ...AUTH_PROVIDERS,
  ],
};
