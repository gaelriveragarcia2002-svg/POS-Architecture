import { Injectable, afterNextRender, signal } from '@angular/core';
import { createDb } from './db-client';
import { items } from './schema';

type Item = typeof items.$inferSelect;

@Injectable({ providedIn: 'root' })
export class SqliteService {

    // * Estados del servicio.
    private db: ReturnType<typeof createDb> | null = null;
    private readonly ready = signal(false);
    private readonly error = signal<string | null>(null);
    private readonly itemList = signal<Item[]>([]);

    // * Estados de lectura.
    public readonly $items = this.itemList.asReadonly();
    public readonly $ready = this.ready.asReadonly();
    public readonly $error = this.error.asReadonly();

    // * Constructor del servicio.
    public constructor() {
        // El worker solo existe en el browser: en SSR no hay Worker ni OPFS.
        afterNextRender(() => {
            const worker = new Worker(
                new URL('./sqlite.worker', import.meta.url),
                { type: 'module' }
            );
            this.db = createDb(worker);
            void this.loadItems();
        });
    }

    // * Metodos del componente.
    async loadItems() {
        if (!this.db) return;
        try {
            this.itemList.set(await this.db.select().from(items));
            // Recien aqui sabemos que el worker respondio y la DB abrio de verdad;
            // que el Worker se construya no garantiza nada.
            this.ready.set(true);
            this.error.set(null);
        } catch (e: unknown) {
            this.ready.set(false);
            this.error.set(e instanceof Error ? e.message : String(e));
        }
    }

    async addItem(name: string, quantity: number) {
        if (!this.db) return;
        try {
            await this.db.insert(items).values({
                id: crypto.randomUUID(),
                name,
                quantity,
                createdAt: new Date().toISOString(),
            });
        } catch (e: unknown) {
            this.error.set(e instanceof Error ? e.message : String(e));
            return;
        }
        await this.loadItems();
    }
}
