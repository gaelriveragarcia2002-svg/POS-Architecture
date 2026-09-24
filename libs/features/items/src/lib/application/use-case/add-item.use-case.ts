import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCase } from '@pos-architecture/core';
import { Item, NewItem } from '../../domain/item';
import { ItemsRepository } from '../../domain/ports/items.repository';

@Injectable({ providedIn: 'root' })
export class AddItemUseCase implements UseCase<NewItem, Item> {

    // * Inyeccion de dependencias.
    private repo = inject(ItemsRepository);   // puerto (resuelto a DrizzleItemsRepository).

    // * Metodo execute del caso de uso.
    public execute(item: NewItem): Observable<Item> {
        return this.repo.add(item);
    }
}
