import { definePreset } from '@openng/optimus-ui-themes';
import Aura from '@openng/optimus-ui-themes/aura';
import type { Preset } from '@openng/optimus-ui-themes/types';

// * Escala 50–950 que apunta a una paleta primitiva de Aura: scale('sky') → { 50: '{sky.50}', ..., 950: '{sky.950}' }.
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const scale = (color: string): Record<number, string> =>
  Object.fromEntries(SHADES.map((shade) => [shade, `{${color}.${shade}}`]));

// * Temas de la app. Cada uno define su versión clara y oscura en colorScheme.
// La escala primary es la misma en los dos modos (bg-primary-500 no cambia); lo que cambia por modo es surface y
// primary.color (Aura usa primary.500 en claro y primary.400 en oscuro).
const OCEAN = definePreset(Aura, {
  semantic: {
    primary: scale('sky'),
    colorScheme: {
      light: { surface: { 0: '#ffffff', ...scale('slate') } },
      dark: { surface: { 0: '#ffffff', ...scale('slate') } },
    },
  },
});

const SUNSET = definePreset(Aura, {
  semantic: {
    primary: scale('rose'),
    colorScheme: {
      light: { surface: { 0: '#ffffff', ...scale('stone') } },
      dark: { surface: { 0: '#ffffff', ...scale('stone') } },
    },
  },
});

export const THEMES = {
  ocean: OCEAN,
  sunset: SUNSET,
} satisfies Record<string, Preset>;

export type ThemeName = keyof typeof THEMES;
export type ColorMode = 'light' | 'dark';

export const DEFAULT_THEME: ThemeName = 'ocean';

// * Clase en <html> que activa el modo oscuro. styles/tailwind.css de esta lib la usa para la variante dark: de Tailwind;
// si cambia aquí, hay que cambiarla allí.
export const DARK_MODE_CLASS = 'app-dark';

// * Tipo de la View Transition que envuelve cada cambio de tema o modo. La app la anima en su CSS con:
// :root:active-view-transition-type(theme) { ... }
export const THEME_TRANSITION_TYPE = 'theme';
