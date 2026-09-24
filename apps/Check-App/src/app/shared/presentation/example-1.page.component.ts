import { JsonPipe } from '@angular/common';
import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FILTRABLE_CATALOG_OPTIONS, ProductsFiltersService } from '../application/store/products-filters.service';
import { ProductsFiltersComponent } from './products-filters.component';

// * Constantes de la demo.
const CATEGORIAS = [1, 2, 3];
const MARCAS = ['acme', 'globex', 'initech'];

/**
 * Demo para verificar ProductsFiltersService: esta pagina declara
 * ['categoria', 'marca'] como sus campos y los va cambiando solo con un
 * interval, para comprobar en vivo que se comparten con example-2 (que
 * declara 'categoria') y que se resetean cuando ya nadie los declara.
 */
@Component({
    selector: 'app-example-1-page',
    imports: [ProductsFiltersComponent, JsonPipe, RouterLink],
    template: `
        <h2>Example 1 — campos: categoria, marca</h2>
        <a routerLink="/example-2">Ir a Example 2</a>
        <app-products-filters [activeFields]="fields" />

        <div class="bg-slate-50 border-black p-2 rounded-lg text-black">
            <p>Union activa (todas las instancias montadas): {{ _filters.activeFields() | json }}</p>
            <p>Payload completo del form (debug, no usar para requests): {{ _filters.payload() | json }}</p>
            <p><strong>Payload real de esta pagina:</strong> {{ _filters.payloadFor(fields) | json }}</p>
        </div>
    `,
})
export class Example1PageComponent {

    // * Inyeccion de dependencias.
    protected readonly _filters = inject(ProductsFiltersService);
    private readonly _destroyRef = inject(DestroyRef);

    // * Campos que ocupa esta pagina.
    public readonly fields: FILTRABLE_CATALOG_OPTIONS[] = ['categoria', 'marca', 'disponibilidad', 'rating', 'sortBy', 'taller'];

    // * Next render SSR safe.
    public readonly nextRender = afterNextRender(() => {
        // const intervalId = setInterval(() => {
        //     this._filters.setFieldValue('categoria', CATEGORIAS[Math.floor(Math.random() * CATEGORIAS.length)]);
        //     this._filters.setFieldValue('marca', MARCAS[Math.floor(Math.random() * MARCAS.length)]);
        // }, 1000);
        // this._destroyRef.onDestroy(() => clearInterval(intervalId));
    });
}
