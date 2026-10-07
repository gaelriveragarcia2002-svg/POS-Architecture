import { EnvironmentProviders } from '@angular/core';
import { provideOptimus } from '@openng/optimus-ui/config';
import { DARK_MODE_CLASS, DEFAULT_THEME, THEMES } from './themes';

// * Configuración global de Optimus para todas las apps: tema inicial, modo oscuro por clase y capas CSS.
export function provideTheme(): EnvironmentProviders {
  return provideOptimus({
    theme: {
      preset: THEMES[DEFAULT_THEME],
      options: {
        darkModeSelector: `.${DARK_MODE_CLASS}`,
        // Optimus va en su propia capa, después de base (preflight de Tailwind) y antes de utilities: así una clase
        // de Tailwind en un componente de Optimus (p-8, bg-primary-100...) gana sin necesitar el !important.
        cssLayer: {
          name: 'optimus',
          order: 'theme, base, optimus',
        },
      },
    },
  });
}
