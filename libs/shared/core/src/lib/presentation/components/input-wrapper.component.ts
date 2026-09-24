import { Component, computed, contentChild, effect, input } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { toLabel } from '@pos-architecture/util-common';

@Component({
	selector: 'lib-input-wrapper',
	host: { class: 'block' },
	template: `
        <div
            class="flex flex-col gap-1
                data-hide-invalid:[--p-inputtext-invalid-border-color:var(--p-inputtext-border-color)]
                data-hide-invalid:[--p-inputtext-invalid-placeholder-color:var(--p-inputtext-placeholder-color)]"
            [attr.data-hide-invalid]="$hideInvalid() ? '' : null"
        >
            <p class="text-sm font-medium leading-5">{{ $final_name() }}</p>

            <ng-content />

            <div class="h-5" aria-live="polite">
                @if ($error(); as error) {
                    <small
                        class="block truncate text-xs leading-5 text-(--p-form-field-invalid-border-color)
                            transition duration-150 ease-out starting:opacity-0 starting:-translate-y-0.5"
                        [title]="error"
                    >{{ error }}</small>
                }
            </div>
        </div>
    `,
})
export class InputWrapperComponent {

    // * Binding del componente.
    public $name = input<string>();

    // * Proyeccion del componente.
    public $field = contentChild(FormField);

    public test = effect(() => {
        console.log("Field", this.$field())
    });

    // Si no se pasa $name, se usa la key del campo en el modelo ('categoria'),
    // no state().name(), que trae el prefijo del form ('ng.form40.categoria').
    protected $final_name = computed(() => {
        const control_name = this.$name() ?? String(this.$field()?.state().keyInParent() ?? "");
        return toLabel(control_name);
    });

    protected $hideInvalid = computed(() => {
        const field = this.$field();
        return !!field && !field.state().touched();
    });

    // Un solo mensaje a la vez (el primero): el espacio reservado es de una
    // linea, y varios errores a la vez harian crecer el contenedor.
    protected $error = computed(() => {
        const state = this.$field()?.state();
        if (!state || !state.touched() || !state.invalid()) return null;
        const error = state.errors()[0];
        return error ? (error.message ?? error.kind) : null;
    });
}
