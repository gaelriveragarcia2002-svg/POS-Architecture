import { InjectionToken, inject } from '@angular/core';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { SqliteConnection } from './sqlite-connection';

/**
 * Cliente drizzle unico para toda la app, montado sobre el unico Worker que
 * expone SqliteConnection. Cada repositorio solo hace inject(SQLITE_DB) y
 * consulta su propia tabla (ver el schema.ts de cada feature) — nadie arma
 * su propio cliente drizzle a mano.
 */
export const SQLITE_DB = new InjectionToken('SQLITE_DB', {
    providedIn: 'root',
    factory: () => {
        const connection = inject(SqliteConnection);
        return drizzle((sql, params, method) =>
            connection
                .getClient()
                .execute(sql, params, method)
                .then((rows) => ({ rows })),
        );
    },
});
