import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { Router, provideRouter, withViewTransitions } from '@angular/router';
import Aura from '@openng/optimus-ui-themes/aura';
import { provideOptimus } from '@openng/optimus-ui/config';
import { appRoutes } from './app.routes';
import { INSPECTIONS_PROVIDERS } from './features/inspections/infrastructure/providers/inspections-providers';
import { ITEMS_PROVIDERS } from './features/items/infrastructure/providers/items-providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withViewTransitions({
        // Etiqueta la navegación para que motion.css elija la animación: A -> A/12 baja un nivel y A/12 -> A sube.
        // Entre rutas hermanas (A -> B) no se etiqueta y aplica la animación base.
        onViewTransitionCreated: ({ transition }) => {
          const navigation = inject(Router).currentNavigation();
          const path = (url?: { toString(): string }) => url?.toString().split(/[?#]/)[0] ?? '';
          const from = path(navigation?.previousNavigation?.finalUrl);
          const to = path(navigation?.finalUrl);

          // Sin navegación previa (carga inicial) no hay de dónde venir.
          if (!from) return;
          if (to.startsWith(from + '/')) transition.types.add('to-child');
          else if (from.startsWith(to + '/')) transition.types.add('to-parent');
        },
      }),
    ),
    provideOptimus({
      theme: {
        preset: Aura
      }
    }),
    ...ITEMS_PROVIDERS,
    ...INSPECTIONS_PROVIDERS,
  ],
};
