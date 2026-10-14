import { Component, inject } from '@angular/core';
import { ReportJobsPanelComponent, ReportJobsStore, ReportService } from '@pos-architecture/reports';
import { ProductsSalesReport } from './products-sales-report';

@Component({
	selector: 'app-products-test',
	standalone: true,
	imports: [ReportJobsPanelComponent],
	template: `
    <button type="button" (click)="enqueueSales()">Generar ventas en segundo plano</button>
    <app-report-jobs-panel />
    `,
})
export class ProductsTestComponent {

    // * Inyeccion de depenendencias.
    private service = inject(ReportService);
    private jobs = inject(ReportJobsStore);
    private salesReport = inject(ProductsSalesReport);

    // * Metodos del componente.
    protected enqueueSales() {
        this.jobs.enqueue(this.salesReport, { from: '2026-01-01', to: '2026-01-31', format: 'xlsx', category: '' });
    }
}
