import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product, ProductsFilter, ProductsRepository } from '@pos-architecture/products';

const SEED: Product[] = [
    { id: '1', name: 'Teclado mecanico', category: 'perifericos', price: 1299, stock: 12 },
    { id: '2', name: 'Mouse inalambrico', category: 'perifericos', price: 459, stock: 3 },
    { id: '3', name: 'Monitor 24"', category: 'pantallas', price: 3499, stock: 7 },
    { id: '4', name: 'Monitor 27" 4K', category: 'pantallas', price: 7899, stock: 2 },
    { id: '5', name: 'Cable HDMI 2m', category: 'cables', price: 149, stock: 40 },
    { id: '6', name: 'Cable USB-C', category: 'cables', price: 189, stock: 4 },
    { id: '7', name: 'Hub USB 4 puertos', category: 'perifericos', price: 349, stock: 18 },
    { id: '8', name: 'Soporte para laptop', category: 'accesorios', price: 599, stock: 1 },
];

/* Implementa el puerto ProductsRepository con datos en memoria: suficiente
 * para demostrar el reporte sin depender del Worker de SQLite. */
@Injectable()
export class InMemoryProductsRepository extends ProductsRepository {

    // * Metodos de la clase.
    public list(filter?: ProductsFilter): Observable<Product[]> {
        const category = filter?.category?.trim().toLowerCase();
        const lowStockBelow = filter?.lowStockBelow;

        return of(
            SEED.filter(
                (p) =>
                    (!category || p.category === category) &&
                    (lowStockBelow === undefined || p.stock < lowStockBelow),
            ),
        );
    }
}
