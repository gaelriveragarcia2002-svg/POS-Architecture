import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideReportJobs, provideReporting } from '@pos-architecture/reports';
import { provideTheme } from '@pos-architecture/util-theme';
import { appRoutes } from './app.routes';
import { INSPECTIONS_PROVIDERS } from './features/inspections/infrastructure/providers/inspections-providers';
import { ITEMS_PROVIDERS } from './features/items/infrastructure/providers/items-providers';
import { PRODUCTS_PROVIDERS } from './features/products/infrastructure/providers/products-providers';
import { onRouteTransitionCreated } from './shared/presentation/animations/route-transitions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      //* Transiciones entre rutas: el callback etiqueta la navegación (hijo/padre) y motion.css elige la animación.
      withViewTransitions({ onViewTransitionCreated: onRouteTransitionCreated }),
    ),
    provideHttpClient(withFetch()),
    //* Tema global de Optimus (presets, modo oscuro y capas CSS) definido en libs/shared/util-theme.
    provideTheme(),
    //* Capacidad de reportes (puerto ReportGateway -> adaptador HTTP).
    provideReporting(),
    //* Reportes asincronos (cola + polling) con backend simulado.
    provideReportJobs(),
    // * Proveedores de dominio de cada feature (Items, Products, Inspections).
    ...ITEMS_PROVIDERS,
    ...PRODUCTS_PROVIDERS,
    ...INSPECTIONS_PROVIDERS,
  ],
};
