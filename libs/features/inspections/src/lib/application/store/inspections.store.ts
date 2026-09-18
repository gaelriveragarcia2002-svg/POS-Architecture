import { Injectable, computed, signal } from '@angular/core';
import { Inspection } from '../../domain/inspection';

@Injectable({ providedIn: 'root' })
export class InspectionsStore {

    // * Atributos del store.
    private readonly _inspections = signal<Inspection[]>([]);
    private readonly _ready = signal(false);
    private readonly _error = signal<string | null>(null);

    public readonly inspections = this._inspections.asReadonly();
    public readonly ready = this._ready.asReadonly();
    public readonly error = this._error.asReadonly();
    public readonly count = computed(() => this._inspections().length);

    // * Mutaciones: solo los use-cases de la feature deberian llamarlas.
    public setInspections(inspections: Inspection[]): void {
        this._inspections.set(inspections);
        this._ready.set(true);
        this._error.set(null);
    }

    public setError(message: string): void {
        this._ready.set(false);
        this._error.set(message);
    }
}
