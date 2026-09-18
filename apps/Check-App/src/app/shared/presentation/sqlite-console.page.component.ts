import {
    Component,
    ElementRef,
    afterNextRender,
    inject,
    signal,
    viewChild,
} from '@angular/core';
import { SQLite, sql } from '@codemirror/lang-sql';
import { Compartment, Prec } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { AgGridAngular } from 'ag-grid-angular';
import {
    AllCommunityModule,
    AutoSizeStrategy,
    ColDef,
    ModuleRegistry,
} from 'ag-grid-community';
import { basicSetup } from 'codemirror';
import { SqliteConnection } from '../infrastructure/sqlite/sqlite-connection';

ModuleRegistry.registerModules([AllCommunityModule]);

/** Esquema para el autocompletado: { tabla: [columnas] }. */
type SqlSchema = Record<string, string[]>;

/**
 * Consola de desarrollo: corre SQL crudo contra la DB local (OPFS) desde el
 * propio navegador, con las tablas descubiertas en vivo desde sqlite_master
 * (no hay que declarar nada por modelo nuevo) y autocompletado de CodeMirror
 * alimentado con ese mismo esquema.
 *
 * NO es para usuarios finales — es una herramienta de debug, sacala (o
 * metela atras de un guard) antes de mandar la app a un tecnico real.
 */
@Component({
    selector: 'app-sqlite-console-page',
    imports: [AgGridAngular],
    host: { class: 'flex h-screen flex-col bg-slate-100 text-slate-900' },
    template: `

        <!-- Header -->
        <header class="flex shrink-0 items-baseline gap-3 border-b border-slate-200 bg-white px-5 py-3">
            <h1 class="text-base font-semibold">Consola SQL</h1>
            <span class="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                debug only
            </span>
            <span class="ml-auto text-xs text-slate-500">
                ⌘/Ctrl + Enter ejecuta · Ctrl + Espacio autocompleta
            </span>
        </header>

        <!-- Tablas descubiertas en vivo -->
        <div class="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-5 py-2.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Tablas</span>
            @for (table of $tables(); track table) {
                <button
                    type="button"
                    class="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                    (click)="browseTable(table)"
                >
                    {{ table }}
                </button>
            } @empty {
                <span class="text-xs text-slate-400">
                    (ninguna todavía — usá la app para que se creen)
                </span>
            }
            <button
                type="button"
                class="rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                title="Refrescar tablas y autocompletado"
                (click)="loadSchema()"
            >
                ↻ refrescar
            </button>
        </div>

        <!-- Editor -->
        <div class="shrink-0 border-b border-slate-200 bg-white px-5 py-3">
            <div
                #editorHost
                class="h-36 overflow-hidden rounded-lg border border-slate-200"
            ></div>

            <div class="mt-2.5 flex items-center gap-3">
                <button
                    type="button"
                    class="rounded-md bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
                    (click)="run()"
                >
                    Ejecutar
                </button>
                @if ($rows(); as rows) {
                    <span class="text-sm text-slate-500">
                        {{ rows.length }} fila{{ rows.length === 1 ? '' : 's' }}
                    </span>
                }
            </div>

            @if ($error(); as error) {
                <p
                    class="mt-2.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 font-mono text-sm text-red-700"
                >
                    {{ error }}
                </p>
            }
        </div>

        <!-- Resultados: ocupa todo el alto restante -->
        <div class="min-h-0 flex-1 p-5">
            @if ($rows(); as rows) {
                @if (rows.length > 0) {
                    <ag-grid-angular
                        class="h-full w-full"
                        [rowData]="rows"
                        [columnDefs]="$columnDefs()"
                        [defaultColDef]="defaultColDef"
                        [autoSizeStrategy]="autoSizeStrategy"
                    />
                } @else {
                    <p class="text-sm text-slate-400">La consulta no devolvió filas.</p>
                }
            } @else {
                <p class="text-sm text-slate-400">
                    Escribí una consulta y ejecutala, o elegí una tabla de arriba.
                </p>
            }
        </div>
    `,
})
export class SqliteConsolePageComponent {

    // * Inyeccion de dependencias.
    private readonly connection = inject(SqliteConnection);

    // * Referencias del template.
    private readonly editorHost = viewChild.required<ElementRef<HTMLElement>>('editorHost');

    // * Estado del componente.
    protected $tables = signal<string[]>([]);
    protected $rows = signal<Record<string, unknown>[] | null>(null);
    protected $columnDefs = signal<ColDef[]>([]);
    protected $error = signal<string | null>(null);

    // * Config de la grilla.
    // Cada columna se dimensiona a su contenido en vez de repartirse el ancho
    // en proporciones fijas; lo que pase de defaultMaxWidth se envuelve en
    // varias lineas (autoHeight) para que igual se vea completo.
    protected readonly autoSizeStrategy: AutoSizeStrategy = {
        type: 'fitCellContents',
        continuous: true,
        defaultMaxWidth: 420,
        scaleUpToFitGridWidth: true,
    };

    protected readonly defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
        wrapText: true,
        autoHeight: true,
    };

    // * CodeMirror: el compartment permite reconfigurar el esquema de
    // autocompletado sin recrear el editor cuando aparecen tablas nuevas.
    private editor: EditorView | null = null;
    private readonly sqlCompartment = new Compartment();

    // * Constructor del componente.
    public constructor() {
        // CodeMirror toca el DOM y el Worker no existe en SSR.
        afterNextRender(() => {
            this.editor = new EditorView({
                doc: 'SELECT * FROM inspections LIMIT 50;',
                parent: this.editorHost().nativeElement,
                extensions: [
                    basicSetup,
                    // El editor llena el alto que le da el contenedor.
                    EditorView.theme({
                        '&': { height: '100%', fontSize: '13px' },
                        '.cm-scroller': { overflow: 'auto', fontFamily: 'ui-monospace, monospace' },
                    }),
                    this.sqlCompartment.of(this.sqlExtension({})),
                    // Prec.highest: basicSetup ya liga Mod-Enter a
                    // insertBlankLine, y gana por orden si no forzamos
                    // precedencia.
                    Prec.highest(
                        keymap.of([
                            {
                                key: 'Mod-Enter',
                                run: () => {
                                    void this.run();
                                    return true;
                                },
                            },
                        ]),
                    ),
                ],
            });
            void this.loadSchema();
        });
    }

    // * Metodos del componente.
    private sqlExtension(schema: SqlSchema) {
        return sql({ dialect: SQLite, schema, upperCaseKeywords: true });
    }

    /**
     * Descubre tablas y columnas en vivo y realimenta el autocompletado.
     * Por eso no hace falta declarar nada cuando se agrega un modelo nuevo.
     */
    protected async loadSchema() {
        try {
            const client = this.connection.getClient();

            const tableRows = (await client.execute(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
                [],
                'all',
            )) as unknown[];
            const tables = tableRows.map((row) => (row as unknown[])[0] as string);
            this.$tables.set(tables);

            const schema: SqlSchema = {};
            for (const table of tables) {
                const columns = (await client.execute(
                    `PRAGMA table_info("${table}");`,
                    [],
                    'all',
                    'object',
                )) as Record<string, unknown>[];
                schema[table] = columns.map((column) => String(column['name']));
            }

            this.editor?.dispatch({
                effects: this.sqlCompartment.reconfigure(this.sqlExtension(schema)),
            });
        } catch (e: unknown) {
            this.$error.set(e instanceof Error ? e.message : String(e));
        }
    }

    protected browseTable(table: string) {
        // Comillas dobles: nombre de tabla, no literal de texto.
        this.setEditorContent(`SELECT * FROM "${table}" LIMIT 200;`);
        void this.run();
    }

    protected async run() {
        this.$error.set(null);
        try {
            const rows = (await this.connection
                .getClient()
                .execute(this.editorContent(), [], 'all', 'object')) as Record<string, unknown>[];

            this.$rows.set(rows);
            this.$columnDefs.set(
                rows.length > 0
                    ? Object.keys(rows[0]).map(
                          // headerName explicito: si no, AG Grid capitaliza
                          // (inspector_id -> Inspector_id) y deja de servir
                          // para copiar el nombre a una query.
                          (field): ColDef => ({ field, headerName: field }),
                      )
                    : [],
            );
        } catch (e: unknown) {
            this.$error.set(e instanceof Error ? e.message : String(e));
            this.$rows.set(null);
        }
    }

    private editorContent(): string {
        return this.editor?.state.doc.toString() ?? '';
    }

    private setEditorContent(content: string) {
        this.editor?.dispatch({
            changes: { from: 0, to: this.editor.state.doc.length, insert: content },
        });
    }
}
