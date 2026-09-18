import { Component, inject } from '@angular/core';
import { SqliteService } from '../../../db/sqlite.service';

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
                <h1>xd</h1>
                @for (item of $items(); track item.id) {
                    <li>{{ item.name }} — {{ item.quantity }}</li>
                }
                 <h1>xd 2</h1>
            </ul>
        </div>
    `,
})
export class HomePageComponent {

    // * Inyeccion de dependencias.
    private readonly sqlite = inject(SqliteService);

    // * Estados de servicios.
    public $items = this.sqlite.$items;
    public $ready = this.sqlite.$ready;
    public $error = this.sqlite.$error;

    // * Metodos del componente.
    public addTestItem() {
        this.sqlite.addItem('Producto ' + Date.now(), Math.floor(Math.random() * 100));
    }
}
