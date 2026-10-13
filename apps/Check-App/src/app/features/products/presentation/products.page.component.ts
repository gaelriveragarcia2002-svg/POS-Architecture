import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ListProductsUseCase, Product } from '@pos-architecture/products';
import { ReportRunnerComponent } from '@pos-architecture/reports';
import { ProductsLowStockReport } from './products-low-stock-report';
import { ProductsReport } from './products-report';

@Component({
	selector: 'app-products-page',
	imports: [CurrencyPipe, ReportRunnerComponent],
	template: `
        <section>
            <h2>Productos</h2>

            <table>
                <thead>
                    <tr><th>Nombre</th><th>Categoria</th><th>Precio</th><th>Stock</th></tr>
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
            <app-report-runner [reports]="reports" />
        </section>
    `,
})
export class ProductsPageComponent {

    // * Inyeccion de dependencias.
    private readonly listProducts = inject(ListProductsUseCase);

    // * Inyeccion de dependencias de reportes.
    private readonly inventoryReport = inject(ProductsReport);
    private readonly lowStockReport = inject(ProductsLowStockReport);

    // * Reportes disponibles en esta pantalla.
    protected readonly reports = [this.inventoryReport, this.lowStockReport];

    // * Estado de UI de esta pantalla.
    protected readonly $products = toSignal<Product[], Product[]>(this.listProducts.execute(), { initialValue: [] });
}
