import { Component, afterNextRender, inject } from '@angular/core';
import { AddItemUseCase, ItemsStore, ListItemsUseCase } from '@pos-architecture/items';

@Component({
	selector: 'app-home-page',
	template: `
        <div>
            <p>Estado: {{ $ready() ? 'listo ✅' : 'inicializando…' }}</p>

            @if ($error(); as error) {
                <p style="color: crimson">Error: {{ error }}</p>
            }

            <button (click)="addTestItem()">Agregar item de prueba</button>

            <ul>
                @for (item of $items(); track item.id) {
                    <li>{{ item.name }} — {{ item.quantity }}</li>
                }
            </ul>
        </div>
    `,
})
export class HomePageComponent {

    // * Inyeccion de casos de uso.
    private readonly listItems = inject(ListItemsUseCase);
    private readonly addItem = inject(AddItemUseCase);

    // * Estados de lectura (via store de la feature).
    private readonly store = inject(ItemsStore);
    public $items = this.store.items;
    public $ready = this.store.ready;
    public $error = this.store.error;

    // * Constructor del componente.
    public constructor() {
        // El Worker solo existe en el browser: en SSR no hay Worker ni OPFS.
        afterNextRender(() => {
            this.listItems.execute().subscribe();
        });
    }

    // * Metodos del componente.
    public addTestItem() {
        this.addItem.execute({
            name: 'Producto ' + Date.now(),
            quantity: Math.floor(Math.random() * 100),
        }).subscribe();
    }
}
