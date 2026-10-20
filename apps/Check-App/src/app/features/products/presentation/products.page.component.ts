import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ListProductsUseCase } from '@pos-architecture/products';
import { ReportFormDefinition, ReportRunnerComponent } from '@pos-architecture/reports';
import { ProductsLowStockReport } from './products-low-stock-report';
import { ProductsReport } from './products-report';
import { ProductsSalesReport } from './products-sales-report';
import { ProductsTestComponent } from './products-test.component';

@Component({
	selector: 'app-products-page',
	imports: [CurrencyPipe, ReportRunnerComponent, ProductsTestComponent],
	template: `
        <section>
            <h2>Productos</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Categoria</th>
                        <th>Precio</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    @for (product of $products(); track product.id) {
                        <tr>
                            <td>{{ product.name }}</td>
                            <td>{{ product.category }}</td>
                            <td>{{ product.price | currency }}</td>
                            <td>{{ product.stock }}</td>
                        </tr>
                    }
                </tbody>
            </table>
        </section>
        <section>
            <h2>Reporte</h2>
            <!-- <app-report-runner [reports]="reports" /> -->

            // * Soy otro componente.
            <app-products-test/>
        </section>
    `,
})
export class ProductsPageComponent {

    // * Inyeccion de dependencias.
    private readonly listProducts = inject(ListProductsUseCase);

    // * Inyeccion de dependencias de reportes.
    private readonly inventoryReport = inject(ProductsReport);
    private readonly lowStockReport = inject(ProductsLowStockReport);
    private readonly salesReport = inject(ProductsSalesReport);

    // * Reportes disponibles en esta pantalla.
    protected readonly reports: ReportFormDefinition[] = [this.inventoryReport, this.lowStockReport, this.salesReport];

    // * Estado de UI de esta pantalla.
    protected readonly $products = toSignal(this.listProducts.execute(), { initialValue: [] });
}
