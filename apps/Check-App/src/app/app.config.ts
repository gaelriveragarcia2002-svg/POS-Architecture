import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { ITEMS_PROVIDERS } from './features/items/infrastructure/providers/items-providers';
import { INSPECTIONS_PROVIDERS } from './features/inspections/infrastructure/providers/inspections-providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    ...ITEMS_PROVIDERS,
    ...INSPECTIONS_PROVIDERS,
  ],
};
