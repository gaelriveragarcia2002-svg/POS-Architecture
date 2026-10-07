import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ApplicationRef, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { usePreset } from '@openng/optimus-ui-themes';
import { ThemeProvider } from '@openng/optimus-ui/config';
import { ColorMode, DARK_MODE_CLASS, DEFAULT_THEME, THEME_TRANSITION_TYPE, ThemeName, THEMES } from './themes';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  // * Inyeccion de dependencias.
  private readonly _document = inject(DOCUMENT);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _appRef = inject(ApplicationRef);
  private readonly _themeProvider = inject(ThemeProvider);

  // * Estados del servicio.
  private readonly _theme = signal<ThemeName>(DEFAULT_THEME);
  private readonly _mode = signal<ColorMode>('light');
  public readonly theme = this._theme.asReadonly();
  public readonly mode = this._mode.asReadonly();
  public readonly themes = Object.keys(THEMES) as ThemeName[];

  // * Metodos del servicio.
  public setTheme(name: ThemeName): void {
    if (name === this._theme()) return;
    this._transition(() => {
      this._theme.set(name);
      // En el servidor no: el preset de Optimus es global del proceso y lo compartirían todas las peticiones.
      if (!isPlatformBrowser(this._platformId)) return;
      // usePreset regenera los tokens y avisa a los componentes de Optimus montados, que reescriben las variables --p-*
      // del <head>. Si no hay ninguno montado nadie las reescribe, por eso se recargan también aquí (si ya se
      // recargaron, no hace nada).
      usePreset(THEMES[name]);
      this._themeProvider.loadCommonTheme();
    });
  }

  // Optimus (darkModeSelector) y la variante dark: de Tailwind miran la misma clase en <html>.
  public setMode(mode: ColorMode): void {
    if (mode === this._mode()) return;
    this._transition(() => {
      this._mode.set(mode);
      this._document.documentElement.classList.toggle(DARK_MODE_CLASS, mode === 'dark');
    });
  }

  public toggleMode(): void {
    this.setMode(this._mode() === 'dark' ? 'light' : 'dark');
  }

  // * Metodos privados.
  // Envuelve el cambio en una View Transition: el navegador captura la página con los colores viejos, aplica el cambio
  // y funde la captura vieja con la nueva (la animación está en el CSS de la app). Sin soporte o con movimiento
  // reducido, el cambio es instantáneo.
  private _transition(apply: () => void): void {

    const reducedMotion = isPlatformBrowser(this._platformId) && matchMedia('(prefers-reduced-motion: reduce)').matches;

    // * Aplica el cambio sin animación si no hay soporte de View Transitions o si el usuario prefiere reducir el movimiento.
    if (!isPlatformBrowser(this._platformId) || !this._document.startViewTransition || reducedMotion) {
      apply();
      return;
    }

    // * Aplica el cambio con animación de View Transition.
    const transition = this._document.startViewTransition({
      update: () => {
        apply();
        // La captura nueva se toma al terminar este callback: se fuerza el render para que las plantillas que leen
        // theme()/mode() ya estén actualizadas en ella.
        this._appRef.tick();
      },
      types: [THEME_TRANSITION_TYPE],
    });
    // Si la transición se salta (dos cambios seguidos, una navegación al mismo tiempo) o se aborta, `ready` se rechaza,
    // pero el cambio se aplica igual: solo se pierde la animación. No es un error de la app.
    transition.ready.catch(() => undefined);
  }
}
