import { Signal } from '@angular/core';

/** Error normalizado, sin importar la API de formularios de donde venga. */
export interface FieldError {
    /** Clave del error ('required', 'rfc', 'minLength'...). Se usa para buscar el mensaje. */
    kind: string;
    /** Datos del error; es lo que reciben las funciones de ERROR_MESSAGES. */
    value: unknown;
    /** Mensaje definido por el propio validador (Signal Forms: `{ message }`). */
    message?: string;
}

/**
 * Contrato que cada API de formularios implementa para el wrapper.
 * Para soportar otra API (o quitar una) solo se agrega/borra su adaptador.
 */
export interface FieldAdapter {
    /** true si hay un control de esta API proyectado en el wrapper. */
    $active: Signal<boolean>;
    $errors: Signal<FieldError[]>;
    /** true cuando el usuario ya salio del campo (blur) o se llamo markAsTouched/markAllAsTouched. */
    $touched: Signal<boolean>;
    /** Nombre deducido del control ('' si no se puede). */
    $name: Signal<string>;
}
