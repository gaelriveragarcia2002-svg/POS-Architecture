import { Injectable, computed, signal } from '@angular/core';
import { Item } from '../../domain/item';

@Injectable({ providedIn: 'root' })
export class ItemsStore {

    // * Atributos del store.
    private readonly _items = signal<Item[]>([]);
    private readonly _ready = signal(false);
    private readonly _error = signal<string | null>(null);

    public readonly items = this._items.asReadonly();
    public readonly ready = this._ready.asReadonly();
    public readonly error = this._error.asReadonly();
    public readonly count = computed(() => this._items().length);

    // * Mutaciones: solo los use-cases de la feature deberian llamarlas.
    public setItems(items: Item[]): void {
        this._items.set(items);
        this._ready.set(true);
        this._error.set(null);
    }

    public setError(message: string): void {
        this._ready.set(false);
        this._error.set(message);
    }
}
