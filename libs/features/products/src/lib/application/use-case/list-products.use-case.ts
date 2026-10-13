import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UseCase } from '@pos-architecture/core';
import { Product, ProductsFilter } from '../../domain/product';
import { ProductsRepository } from '../../domain/ports/products.repository';

@Injectable({ providedIn: 'root' })
export class ListProductsUseCase implements UseCase<ProductsFilter | undefined, Product[]> {

    // * Inyeccion de dependencias.
    private repo = inject(ProductsRepository);   // puerto (resuelto a InMemoryProductsRepository).

    // * Metodo execute del caso de uso.
    public execute(filter?: ProductsFilter): Observable<Product[]> {
        return this.repo.list(filter);
    }
}
