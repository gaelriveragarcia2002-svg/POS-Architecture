import { Provider } from '@angular/core';
import { ItemsRepository } from '@pos-architecture/items';
import { DrizzleItemsRepository } from '../adapters/drizzle-items.repository';

export const ITEMS_PROVIDERS: Provider[] = [
    { useClass: DrizzleItemsRepository, provide: ItemsRepository },
];
