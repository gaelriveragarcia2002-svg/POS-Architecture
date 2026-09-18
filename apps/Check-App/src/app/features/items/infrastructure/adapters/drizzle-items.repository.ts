import { Injectable, inject } from '@angular/core';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { Observable, from, map } from 'rxjs';
import { SqliteConnection } from '../../../../shared/infrastructure/sqlite/sqlite-connection';
import { Item, ItemsRepository, NewItem } from '@pos-architecture/items';
import { ItemMapper } from '../mappers/item.mapper';
import { items } from '../persistence/items.schema';

/* Implementa el puerto ItemsRepository sobre drizzle-orm/sqlite-proxy,
 * hablando con el unico Worker de SQLite de la app via SqliteConnection. */
@Injectable()
export class DrizzleItemsRepository extends ItemsRepository {

    // * Inyeccion de dependencias.
    private connection = inject(SqliteConnection);

    // * Cliente drizzle: solo guarda el callback, no toca el Worker todavia
    // (eso pasa recien en la primera query real, ver ensureReady()).
    private db = drizzle((sql, params, method) =>
        this.connection
            .getClient()
            .execute(sql, params, method)
            .then((rows) => ({ rows })),
    );

    // Migracion perezosa: el worker es generico y no crea tablas por su
    // cuenta, asi que este adaptador es dueño de migrar su propio esquema.
    // Se dispara en la PRIMERA query real, nunca en la construccion de la
    // clase, para no crear el Worker durante SSR.
    private migrated: Promise<void> | null = null;

    // * Metodos de la clase.
    public list(): Observable<Item[]> {
        return from(this.ensureReady().then(() => this.db.select().from(items))).pipe(
            map((rows) => rows.map(ItemMapper.toDomain)),
        );
    }

    public add(item: NewItem): Observable<Item> {
        const row = {
            id: crypto.randomUUID(),
            name: item.name,
            quantity: item.quantity,
            createdAt: new Date().toISOString(),
        };
        return from(
            this.ensureReady()
                .then(() => this.db.insert(items).values(row))
                .then(() => row),
        ).pipe(map(ItemMapper.toDomain));
    }

    private ensureReady(): Promise<void> {
        this.migrated ??= this.migrate();
        return this.migrated;
    }

    private async migrate(): Promise<void> {
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS items (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                quantity INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
            )
        `);
    }
}
