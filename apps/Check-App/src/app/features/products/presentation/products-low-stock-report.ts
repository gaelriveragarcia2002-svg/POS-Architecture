import { Injectable, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { ListProductsUseCase } from '@pos-architecture/products';
import { ReportFormDefinition } from '@pos-architecture/reports';
import { buildLowStockCsv } from '../application/products-csv';

interface LowStockForm {
    threshold: string;
}

interface LowStockPayload {
    threshold: number;
}

/* Reporte B: mismo feature, otros filtros y otro contenido que el reporte A.
 * Tambien define `generate` (CSV en el cliente); si en el futuro lo genera un
 * backend, basta quitar `generate` y declarar `endpoint`. */
@Injectable({ providedIn: 'root' })
export class ProductsLowStockReport implements ReportFormDefinition<LowStockForm, LowStockPayload> {

    // * Inyeccion de dependencias.
    private listProducts = inject(ListProductsUseCase);

    // * Identidad del reporte.
    public readonly id = 'products-low-stock';
    public readonly label = 'Productos con stock bajo';
    public readonly extension = 'csv';

    // * Metodos del reporte.
    public buildForm(fb: NonNullableFormBuilder) {
        return fb.group({
            // El runner pinta los campos de texto como <input type="text">: se convierte en toPayload.
            threshold: fb.control('5'),
        });
    }

    public toPayload(value: LowStockForm): LowStockPayload {
        return { threshold: Number(value.threshold) || 0 };
    }

    public generate(payload: LowStockPayload): Observable<Blob> {
        return this.listProducts
            .execute({ lowStockBelow: payload.threshold })
            .pipe(map((products) => new Blob([buildLowStockCsv(products, payload.threshold)], { type: 'text/csv;charset=utf-8' })));
    }
}
