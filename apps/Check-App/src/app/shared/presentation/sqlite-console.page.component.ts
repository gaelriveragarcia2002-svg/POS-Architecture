import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { SqliteConnection } from '../infrastructure/sqlite/sqlite-connection';

/**
 * Consola de desarrollo: corre SQL crudo contra la DB local (OPFS) desde el
 * propio navegador, sin exportar nada. NO es para usuarios finales — es una
 * herramienta de debug, sacala (o metela atras de un guard) antes de
 * mandar la app a un tecnico real.
 */
@Component({
    selector: 'app-sqlite-console-page',
    imports: [JsonPipe],
    template: `
        <div>
            <h1>Consola SQL (OPFS)</h1>
            <p style="opacity:.7">
                Debug only. Las filas se muestran como arrays posicionales
                (sin nombre de columna) — para algo mas parecido a pgAdmin
                usa OPFS Explorer + DB Browser for SQLite.
            </p>

            <textarea
                rows="4"
                style="width:100%; font-family: monospace"
                [value]="sql()"
                (input)="sql.set($any($event.target).value)"
            ></textarea>

            <div>
                <button (click)="run()">Ejecutar</button>
                <button (click)="runQuick('tables')">Ver tablas</button>
                <button (click)="runQuick('inspections')">Ver inspections</button>
                <button (click)="runQuick('items')">Ver items</button>
            </div>

            @if ($error(); as error) {
                <p style="color: crimson">{{ error }}</p>
            }

            @if ($rows(); as rows) {
                <p>{{ rows.length }} fila(s)</p>
                <pre>{{ rows | json }}</pre>
            }
        </div>
    `,
})
export class SqliteConsolePageComponent {

    // * Inyeccion de dependencias.
    private readonly connection = inject(SqliteConnection);

    // * Estado del componente.
    protected sql = signal('SELECT name FROM sqlite_master WHERE type=\'table\';');
    protected $rows = signal<unknown[] | null>(null);
    protected $error = signal<string | null>(null);

    // * Metodos del componente.
    protected runQuick(target: 'tables' | 'inspections' | 'items') {
        const queries: Record<typeof target, string> = {
            tables: "SELECT name FROM sqlite_master WHERE type='table';",
            inspections: 'SELECT * FROM inspections;',
            items: 'SELECT * FROM items;',
        };
        this.sql.set(queries[target]);
        this.run();
    }

    protected async run() {
        this.$error.set(null);
        try {
            const rows = await this.connection.getClient().execute(this.sql(), [], 'all');
            this.$rows.set(rows as unknown[]);
        } catch (e: unknown) {
            this.$error.set(e instanceof Error ? e.message : String(e));
            this.$rows.set(null);
        }
    }
}
