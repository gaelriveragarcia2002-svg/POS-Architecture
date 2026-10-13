import { Injectable, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { ListProductsUseCase, ProductsFilter } from '@pos-architecture/products';
import { ReportFormDefinition } from '@pos-architecture/reports';
import { buildProductsCsv } from '../application/products-csv';

const LOW_STOCK_THRESHOLD = 5;

interface ProductsReportForm {
    category: string;
    onlyLowStock: boolean;
}

/* Definicion del reporte de productos: el runner pinta el formulario y, como
 * define `generate`, ReportService no llama al gateway HTTP: el CSV se arma
 * en el cliente con los productos del feature. */
@Injectable({ providedIn: 'root' })
export class ProductsReport implements ReportFormDefinition<ProductsReportForm, ProductsFilter> {

    // * Inyeccion de dependencias.
    private listProducts = inject(ListProductsUseCase);

    // * Identidad del reporte.
    public readonly id = 'products';
    public readonly label = 'Reporte de productos';
    public readonly extension = 'csv';

    // * Metodos del reporte.
    public buildForm(fb: NonNullableFormBuilder) {
        return fb.group({
            category: fb.control(''),
            onlyLowStock: fb.control(false),
        });
    }

    public toPayload(value: ProductsReportForm): ProductsFilter {
        return {
            category: value.category || undefined,
            lowStockBelow: value.onlyLowStock ? LOW_STOCK_THRESHOLD : undefined,
        };
    }

    public generate(payload: ProductsFilter): Observable<Blob> {
        return this.listProducts
            .execute(payload)
            .pipe(map((products) => new Blob([buildProductsCsv(products)], { type: 'text/csv;charset=utf-8' })));
    }
}
