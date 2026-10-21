import { Component, computed, contentChild, input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormField } from '@angular/forms/signals'; // [Signal Forms]
import { ERROR_MESSAGES, ErrorMessages } from '../validators/validators-custom';
import { FieldAdapter } from './adapters/field-adapter';
import { reactiveFormsAdapter } from './adapters/reactive-forms.adapter';
import { signalFormsAdapter } from './adapters/signal-forms.adapter'; // [Signal Forms]

@Component({
	selector: 'lib-input-wrapper',
	template: `
        <aside class="flex flex-col gap-2">
            <div>
                <small class="font-semibold">{{$nombre_display()}}</small>
            </div>
            <div>
                <ng-content></ng-content>
            </div>
            <!-- Alto fijo de una linea: el espacio existe aunque no haya error, asi el layout no salta. -->
            <div class="h-4" aria-live="polite">
                @if($error(); as e){
                    <small class="block truncate text-xs leading-5 text-red-500" [title]="e">{{e}}</small>
                }
            </div>
        </aside>
    `,
})
export class InputWrapperComponent {

    // * Proyeccion del componente.
    private $ngControl = contentChild(NgControl);
    private $formField = contentChild(FormField); // [Signal Forms]

    // * Binding del componente.
    public $nombre = input<string | undefined>("", {alias: "nombre"});
    // Sobreescritura de mensajes solo para esta instancia.
    public $mensajes = input<ErrorMessages>({}, {alias: "mensajes"});

    // * Adaptadores de formularios.
    // Gana el primero activo. Signal Forms va antes porque [formField] tambien expone un NgControl.
    private readonly _adapters: FieldAdapter[] = [
        signalFormsAdapter(this.$formField), // [Signal Forms]
        reactiveFormsAdapter(this.$ngControl),
    ];
    private $adapter = computed(() => this._adapters.find(a => a.$active()));

    // * Computados del componente.
    // Mensaje del primer error, solo cuando el campo ya fue tocado (patron recomendado por Angular).
    // Prioridad del texto: instancia > mensaje del validador > global > la clave.
    public $error = computed(() => {
        const adapter = this.$adapter();
        if(!adapter?.$touched()) return null;
        const error = adapter.$errors()[0];
        if(!error) return null;
        const msg = this.$mensajes()[error.kind];
        if(msg) return msg(error.value);
        if(error.message) return error.message;
        return ERROR_MESSAGES[error.kind]?.(error.value) ?? error.kind;
    });

    public $nombre_display = computed(() => {
        // Prioridad: el input explícito 'nombre', luego el que deduzca el adaptador.
        return this.normalize(this.$nombre() || this.$adapter()?.$name());
    });

    // * Metodos del componente.
    public normalize(v: string | undefined){
        if(!v) return v;
        return v[0].toUpperCase() + v.substring(1, v.length).toLowerCase();
    }
}
