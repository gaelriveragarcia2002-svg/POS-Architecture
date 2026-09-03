import { InjectionToken } from '@angular/core';

// * Sustituye a `environments/environment.ts` del proyecto monolítico.
// * Una lib no puede alcanzar los environments de una app: con varias apps
// * (terminal, backoffice, kiosco) cada una tendría el suyo. Cada app provee
// * este token en su app.config.ts.
export interface ApiConfig {
  apiUrl: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');
