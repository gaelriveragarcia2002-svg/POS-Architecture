import { computed, effect, Injectable, signal, untracked } from '@angular/core';
import { form, pattern, required } from '@angular/forms/signals';
import {
    ALL_FILTRABLE_KEYS,
    CatalogState,
    FilterRegistrationId,
    FILTRABLE_CATALOG_OPTIONS,
    FILTRABLE_STATE,
    INITIAL_PAGINATION,
    MutableCatalogState,
    PaginationState,
} from './products-filters.model';

export type { FilterRegistrationId, FILTRABLE_CATALOG_OPTIONS } from './products-filters.model';

@Injectable({ providedIn: 'root' })
export class ProductsFiltersService {

    // * Estado del servicio.
    // La paginacion la maneja quien renderiza la tabla/paginador (via setPagination);
    // no pasa por signal-forms porque no es un formulario, es estado de tabla.
    private readonly _pagination = signal<PaginationState>({ ...INITIAL_PAGINATION });
    private $mutable_form = form(signal<MutableCatalogState>({...FILTRABLE_STATE},), (s) => {
        required(s.categoria, {message: "La categoria es requerida"});
        // pattern solo aplica a campos string (categoria es number | null).
        pattern(s.marca, /^[a-zA-Z ]*$/, {message: "La marca solo acepta letras"});
        required(s.marca, {message: "La marca es obligatoria"})
    });

    // Cada instancia montada de app-products-filters se registra con sus propios
    // campos; un campo se resetea a su default solo cuando ninguna instancia
    // activa lo necesita, asi A y B pueden coexistir (o sucederse) compartiendo
    // los campos compatibles sin pisarse entre si.
    private readonly _registrations = signal<ReadonlyMap<FilterRegistrationId, ReadonlyArray<FILTRABLE_CATALOG_OPTIONS>>>(new Map());

    // * Union de los campos declarados por todas las instancias montadas.
    public readonly activeFields = computed<ReadonlyArray<FILTRABLE_CATALOG_OPTIONS>>(() => {
        const union = new Set<FILTRABLE_CATALOG_OPTIONS>();
        for (const fields of this._registrations().values()) {
            for (const field of fields) union.add(field);
        }
        return Array.from(union);
    });
    // * Campos de paginacion activos en la pagina actual.
    public readonly pagination = this._pagination.asReadonly();

    // * Payload combinado (paginacion + TODOS los campos del form) para debug/UI.
    // No usar esto para armar la request: puede incluir campos de otra pagina
    // si el registro/desregistro de otra instancia aun no se resolvio.
    public readonly payload = computed<CatalogState>(() => ({
        ...this._pagination(),
        ...this.$mutable_form().value(),
    }));

    // * Payload real para la request: cada pagina pasa exactamente los campos
    // que declaro (los mismos que uso en registerActiveFields) y solo esos se
    // incluyen, sin importar que haya quedado registrado por otras instancias.
    // Esto es lo que garantiza que "marca" nunca llegue al payload de B, sin
    // depender de que el prune de A ya haya corrido a tiempo.
    // No arranca desde FILTRABLE_STATE: si arrancara ahi, los campos no
    // declarados igual aparecerian en el objeto (en null) en vez de estar
    // ausentes.
    public payloadFor(fields: ReadonlyArray<FILTRABLE_CATALOG_OPTIONS>): PaginationState & Partial<MutableCatalogState> {
        const current = this.$mutable_form().value();
        const filtered: Partial<MutableCatalogState> = {};
        for (const key of fields) {
            this._assignField(filtered, current, key);
        }
        return { ...this._pagination(), ...filtered };
    }

    // * Deteccion de cambios.
    private payloadChange = effect(() => {
        console.log("Cambios del payload global!", this.payload())
    });

    // * Mutaciones: cada instancia de app-products-filters se registra al
    // montarse con sus propios campos, y se desregistra al destruirse.
    public registerActiveFields(fields: ReadonlyArray<FILTRABLE_CATALOG_OPTIONS>): FilterRegistrationId {
        const id = Symbol();
        this._registrations.update((current) => {
            const next = new Map(current);
            next.set(id, fields);
            return next;
        });
        this._pruneInactiveFields();
        return id;
    }

    public unregisterActiveFields(id: FilterRegistrationId): void {
        this._registrations.update((current) => {
            const next = new Map(current);
            next.delete(id);
            return next;
        });
        this._pruneInactiveFields();
    }

    // * Mutaciones: quien controla la tabla/paginador reporta aqui sus cambios.
    public setPagination(partial: Partial<PaginationState>): void {
        this._pagination.update((current) => ({ ...current, ...partial }));
    }

    // * Acceso a un nodo de campo especifico del form, para bindear un
    // control real de Signal Forms ([formField]) sin exponer $mutable_form
    // completo: quien llama solo recibe el nodo del campo que pidio, no
    // puede llegar a los demas campos a traves de el.
    public fieldFor<K extends FILTRABLE_CATALOG_OPTIONS>(key: K) {
        return this.$mutable_form[key];
    }

    // * Mutaciones: setter generico para un campo del form de filtros
    // (lo usan los controles de UI y, mientras no hay UI real, los ejemplos).
    public setFieldValue<K extends FILTRABLE_CATALOG_OPTIONS>(key: K, value: MutableCatalogState[K]): void {
        //  console.log("Formulario mutable: ", key, value);
        // untracked: esto es una mutacion, no debe registrar sus lecturas
        // internas como dependencia de quien sea que la haya llamado (si un
        // effect llama a este metodo, no queremos que el escribe termine
        // marcando sucio al propio effect que lo invoco).
        untracked(() => {
            const current = this.$mutable_form().value();
            if (current[key] === value) return;

            const next: MutableCatalogState = { ...current, [key]: value };
            this.$mutable_form().value.set(next);
        });
    }

    // * Metodos auxiliares.
    // Un unregister+register consecutivos (tipico de un cambio de ruta: el
    // componente viejo se destruye y desregistra antes de que el nuevo se
    // cree y registre) no deben pasar por un instante intermedio con la
    // union vacia -- si pruneamos ahi, un campo compartido por ambas paginas
    // se resetea a null justo antes de que la pagina nueva lo reclame de
    // nuevo. Un queueMicrotask no basta: el efecto del componente nuevo
    // tampoco corre sincronicamente al crearse (Angular lo agenda para su
    // propio flush de effects), asi que puede caer despues de nuestro
    // microtask. setTimeout(0) es un macrotask: corre despues de que se
    // vacie TODA la cola de microtasks, incluido el flush interno de
    // effects de Angular, asi que para entonces ya se aplicaron todos los
    // register/unregister del mismo ciclo de navegacion.
    private _pruneScheduled = false;

    private _pruneInactiveFields(): void {
        if (this._pruneScheduled) return;
        this._pruneScheduled = true;
        setTimeout(() => {
            this._pruneScheduled = false;

            // untracked: es una mutacion interna, no debe encadenarse como
            // dependencia de quien haya disparado el register/unregister.
            untracked(() => {
                const active = new Set(this.activeFields());
                const current = this.$mutable_form().value();
                const next: MutableCatalogState = { ...current };
                let changed = false;

                for (const key of ALL_FILTRABLE_KEYS) {
                    if (!active.has(key) && current[key] !== FILTRABLE_STATE[key]) {
                        this._assignField(next, FILTRABLE_STATE, key);
                        changed = true;
                    }
                }
                // No escribir si nada cambio realmente: evita que register/unregister
                // notifiquen a payload/payloadChange con un objeto "distinto" que en
                // el fondo tiene el mismo contenido.
                if (changed) {
                    this.$mutable_form().value.set(next);
                }
            });
        });
    }

    private _assignField<K extends FILTRABLE_CATALOG_OPTIONS>(
        target: Partial<MutableCatalogState>,
        source: MutableCatalogState,
        key: K,
    ): void {
        target[key] = source[key];
    }
}
