import { Signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormGroup, NgControl, StatusChangeEvent, TouchedChangeEvent } from '@angular/forms';
import { filter, of, switchMap } from 'rxjs';
import { FieldAdapter } from './field-adapter';

/** Adaptador para Reactive Forms (formControlName, [formControl]) y ngModel. Requiere injection context. */
export function reactiveFormsAdapter($ngControl: Signal<NgControl | undefined>): FieldAdapter {
    // AbstractControl no es reactivo a signals: cada evento de estado o de touched cambia este signal
    // para forzar el recalculo. `events?` porque el NgControl de compatibilidad de Signal Forms no tiene 'events'.
    const $tick = toSignal(
        toObservable($ngControl).pipe(
            switchMap(dir => dir?.control?.events?.pipe(
                filter(e => e instanceof StatusChangeEvent || e instanceof TouchedChangeEvent),
            ) ?? of(null)),
        ),
    );

    return {
        $active: computed(() => !!$ngControl()?.control),

        $errors: computed(() => {
            $tick();
            const errors = $ngControl()?.errors ?? {};
            return Object.entries(errors).map(([kind, value]) => ({ kind, value }));
        }),

        $touched: computed(() => {
            $tick();
            return !!$ngControl()?.touched;
        }),

        $name: computed(() => {
            const c = $ngControl();
            if(!c) return "";
            // 1. Si la directiva tiene un 'name' (ej. FormControlName), úsalo
            if(c.name != null) return c.name.toString();
            // 2. Deducir el nombre desde el FormGroup padre (para [formControl])
            return c.control ? getControlName(c.control) : "";
        }),
    };
}

function getControlName(control: AbstractControl): string {
    const parent = control.parent;
    if(!(parent instanceof FormGroup)) return "";
    // Busca la clave cuyo valor sea exactamente el control que buscamos
    return Object.entries(parent.controls).find(([, c]) => c === control)?.[0] ?? "";
}
