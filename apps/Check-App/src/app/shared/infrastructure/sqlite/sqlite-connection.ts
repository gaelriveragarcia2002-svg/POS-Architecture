import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createSqliteClient, type SqliteClient } from './sqlite-rpc-client';

/**
 * Dueño del unico Worker de SQLite de la app. Cualquier feature que necesite
 * persistencia local inyecta esto y arma su propio cliente drizzle encima
 * del SqliteClient que expone — asi hay un solo Worker y una sola conexion
 * OPFS por pestaña, sin importar cuantas features la usen.
 */
@Injectable({ providedIn: 'root' })
export class SqliteConnection {

    // * Inyeccion de dependencias.
    private readonly platformId = inject(PLATFORM_ID);

    // * Estado interno.
    private client: SqliteClient | null = null;

    // * Metodos del servicio.
    public getClient(): SqliteClient {
        // El Worker y OPFS no existen en SSR; quien llame a esto fuera del
        // navegador tiene un bug (deberia estar detras de afterNextRender).
        if (!isPlatformBrowser(this.platformId)) {
            throw new Error(
                'SqliteConnection solo esta disponible en el navegador (no hay Worker/OPFS en SSR).',
            );
        }

        // Un solo Worker por pestaña, se crea recien cuando alguien lo pide.
        this.client ??= createSqliteClient(
            new Worker(new URL('./sqlite.worker', import.meta.url), { type: 'module' }),
        );
        return this.client;
    }
}
