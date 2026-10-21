// [Signal Forms] Archivo opcional: requiere Angular 21+. Para proyectos sin Signal Forms,
// borrar este archivo y las lineas marcadas con [Signal Forms] en input-wrapper.component.ts.
import { Signal, computed } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { FieldAdapter } from './field-adapter';

/** Adaptador para Signal Forms ([formField]). FieldState ya expone signals, no hace falta suscribirse. */
export function signalFormsAdapter($formField: Signal<FormField<unknown> | undefined>): FieldAdapter {
    const $state = computed(() => $formField()?.state());

    return {
        $active: computed(() => !!$formField()),

        // El error completo es el 'value': los built-in traen sus datos ahi ({ kind: 'minLength', minLength: 3 }).
        $errors: computed(() =>
            ($state()?.errors() ?? []).map(e => ({ kind: e.kind, value: e, message: e.message })),
        ),

        $touched: computed(() => !!$state()?.touched()),

        // keyInParent es la key del modelo ('categoria'); state().name() trae el prefijo del form.
        $name: computed(() => String($state()?.keyInParent() ?? "")),
    };
}
