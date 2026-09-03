import { ApiConfig } from '@pos-architecture/core';

// Configuración por defecto = producción (build.defaultConfiguration).
// El tipo vive en la lib core: una sola fuente de verdad para la forma.
export const environment: ApiConfig = {
  apiUrl: 'https://api.pos.produccion/api',
};
