import { inject, provideAppInitializer } from '@angular/core';
import { MeUseCase, RefreshUseCase } from '@pos-architecture/auth';
import { catchError, of, switchMap } from 'rxjs';

// * Política de arranque de ESTA app: restaurar la sesión desde el refresh token.
// * Vive en la app y no en la lib a propósito: otra app (p.ej. un kiosco)
// * podría no querer restaurar sesión al arrancar.
export function provideAppBootstrap() {
  return provideAppInitializer(() => {
    // * Casos de uso.
    const refresh = inject(RefreshUseCase);
    const me = inject(MeUseCase);

    // * Flujo de ejecucion.
    return refresh.execute().pipe(
      switchMap(() => me.execute()),
      catchError(() => of(null)),
    );
  });
}
