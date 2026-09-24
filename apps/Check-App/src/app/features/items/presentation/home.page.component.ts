import { Component, afterNextRender, inject, signal } from '@angular/core';
import { AddItemUseCase, Item, ListItemsUseCase } from '@pos-architecture/items';

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

    // * Estado de UI de esta pantalla (no es responsabilidad de application).
    public $items = signal<Item[]>([]);
    public $ready = signal(false);
    public $error = signal<string | null>(null);

    // * Constructor del componente.
    public constructor() {
        // El Worker solo existe en el browser: en SSR no hay Worker ni OPFS.
        afterNextRender(() => this.reload());
    }

    // * Metodos del componente.
    public addTestItem() {
        this.addItem.execute({
            name: 'Producto ' + Date.now(),
            quantity: Math.floor(Math.random() * 100),
        }).subscribe({
            next: () => this.reload(),
            error: (e: unknown) => this.$error.set(e instanceof Error ? e.message : String(e)),
        });
    }

    private reload() {
        this.listItems.execute().subscribe({
            next: (items) => {
                this.$items.set(items);
                this.$ready.set(true);
                this.$error.set(null);
            },
            error: (e: unknown) => {
                this.$ready.set(false);
                this.$error.set(e instanceof Error ? e.message : String(e));
            },
        });
    }
}
