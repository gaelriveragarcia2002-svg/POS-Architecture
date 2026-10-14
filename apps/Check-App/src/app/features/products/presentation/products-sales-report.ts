import { Injectable } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { ReportFormDefinition, dateRangeControls, formatControl } from '@pos-architecture/reports';

interface ProductsSalesForm {
    from: string;
    to: string;
    format: 'pdf' | 'xlsx';
    category: string;
}

interface ProductsSalesPayload {
    from: string;
    to: string;
    format: 'pdf' | 'xlsx';
    category?: string;
}

/* Reporte C (inventado): no define `generate`, asi que ReportService delega en
 * el gateway HTTP y hace POST a `endpoint`. La ruta no existe en el backend:
 * sirve para ver el flujo por HTTP (endpoint del reporte > REPORT_ENDPOINT). */
@Injectable({ providedIn: 'root' })
export class ProductsSalesReport implements ReportFormDefinition<ProductsSalesForm, ProductsSalesPayload> {

    // * Identidad del reporte.
    public readonly id = 'products-sales';
    public readonly label = 'Ventas por producto (HTTP)';
    public readonly endpoint = '/api/reports/products/sales';

    // * Metodos del reporte.
    public buildForm(fb: NonNullableFormBuilder) {
        return fb.group({
            ...dateRangeControls(fb),
            ...formatControl(fb),
            category: fb.control(''),
        });
    }

    public toPayload(value: ProductsSalesForm): ProductsSalesPayload {
        return {
            from: value.from,
            to: value.to,
            format: value.format,
            category: value.category || undefined,
        };
    }
}
