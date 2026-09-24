import { JsonPipe } from '@angular/common';
import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FILTRABLE_CATALOG_OPTIONS, ProductsFiltersService } from '../application/store/products-filters.service';
import { ProductsFiltersComponent } from './products-filters.component';

// * Constantes de la demo.
const CATEGORIAS = [1, 2, 3];
const TALLERES = [10, 20, 30];

/**
 * Contraparte de example-1: declara ['categoria', 'taller']. 'categoria' es
 * compatible con example-1 (se comparte); 'taller' no lo declara example-1,
 * asi que al desmontar esta pagina deberia resetearse si nadie mas lo pide.
 */
@Component({
    selector: 'app-example-2-page',
    imports: [ProductsFiltersComponent, JsonPipe, RouterLink],
    template: `
        <h2>Example 2 — campos: categoria, taller</h2>
        <a routerLink="/example-1">Ir a Example 1</a>
        <app-products-filters [activeFields]="fields" />

        <p>Union activa (todas las instancias montadas): {{ _filters.activeFields() | json }}</p>
        <p>Payload completo del form (debug, no usar para requests): {{ _filters.payload() | json }}</p>
        <p><strong>Payload real de esta pagina:</strong> {{ _filters.payloadFor(fields) | json }}</p>
    `,
})
export class Example2PageComponent {

    // * Inyeccion de dependencias.
    protected readonly _filters = inject(ProductsFiltersService);
    private readonly _destroyRef = inject(DestroyRef);

    // * Campos que ocupa esta pagina.
    public readonly fields: FILTRABLE_CATALOG_OPTIONS[] = ['categoria', 'taller'];

    // * Next render SSR safe.
    public readonly nextRender = afterNextRender(() => {
        // const intervalId = setInterval(() => {
        //     this._filters.setFieldValue('categoria', CATEGORIAS[Math.floor(Math.random() * CATEGORIAS.length)]);
        //     this._filters.setFieldValue('taller', TALLERES[Math.floor(Math.random() * TALLERES.length)]);
        // }, 1500);
        // this._destroyRef.onDestroy(() => clearInterval(intervalId));
    });
}
