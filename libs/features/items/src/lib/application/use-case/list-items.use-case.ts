import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { UseCase } from '@pos-architecture/core';
import { Item } from '../../domain/item';
import { ItemsRepository } from '../../domain/ports/items.repository';
import { ItemsStore } from '../store/items.store';

@Injectable({ providedIn: 'root' })
export class ListItemsUseCase implements UseCase<void, Item[]> {

    // * Inyeccion de dependencias.
    private repo = inject(ItemsRepository);   // puerto (resuelto a DrizzleItemsRepository).
    private store = inject(ItemsStore);

    // * Metodo execute del caso de uso.
    public execute(): Observable<Item[]> {
        return this.repo.list().pipe(
            tap((items) => this.store.setItems(items)),
            catchError((e: unknown) => {
                this.store.setError(e instanceof Error ? e.message : String(e));
                return throwError(() => e);
            }),
        );
    }
}
