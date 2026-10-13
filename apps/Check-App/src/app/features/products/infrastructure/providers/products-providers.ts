import { Provider } from '@angular/core';
import { ProductsRepository } from '@pos-architecture/products';
import { InMemoryProductsRepository } from '../adapters/in-memory-products.repository';

export const PRODUCTS_PROVIDERS: Provider[] = [
    { useClass: InMemoryProductsRepository, provide: ProductsRepository },
];
