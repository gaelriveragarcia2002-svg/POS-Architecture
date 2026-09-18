import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';
import { UseCase } from '@pos-architecture/core';
import { Item, NewItem } from '../../domain/item';
import { ItemsRepository } from '../../domain/ports/items.repository';
import { ItemsStore } from '../store/items.store';
import { ListItemsUseCase } from './list-items.use-case';

@Injectable({ providedIn: 'root' })
export class AddItemUseCase implements UseCase<NewItem, Item> {

    // * Inyeccion de dependencias.
    private repo = inject(ItemsRepository);   // puerto (resuelto a DrizzleItemsRepository).
    private store = inject(ItemsStore);
    private listItems = inject(ListItemsUseCase);

    // * Metodo execute del caso de uso.
    public execute(item: NewItem): Observable<Item> {
        return this.repo.add(item).pipe(
            // Releemos tras insertar para que $items refleje el estado real
            // de la DB, no solo el item recien creado.
            switchMap((created) => this.listItems.execute().pipe(map(() => created))),
            catchError((e: unknown) => {
                this.store.setError(e instanceof Error ? e.message : String(e));
                return throwError(() => e);
            }),
        );
    }
}
