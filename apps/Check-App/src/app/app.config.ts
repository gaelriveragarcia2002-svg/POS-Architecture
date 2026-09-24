import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import Aura from '@openng/optimus-ui-themes/aura';
import { provideOptimus } from '@openng/optimus-ui/config';
import { appRoutes } from './app.routes';
import { INSPECTIONS_PROVIDERS } from './features/inspections/infrastructure/providers/inspections-providers';
import { ITEMS_PROVIDERS } from './features/items/infrastructure/providers/items-providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideOptimus({
      theme: {
        preset: Aura
      }
    }),
    ...ITEMS_PROVIDERS,
    ...INSPECTIONS_PROVIDERS,
  ],
};
