import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Clave del error -> funcion que recibe el valor del error y devuelve el mensaje. */
export type ErrorMessages = Record<string, (error: any) => string>;

// * Persona fisica: 4 letras | moral: 3 letras, + fecha AAMMDD + homoclave (2 alfanum + digito verificador).
const RFC_REGEX = /^([A-ZÑ&]{3,4})(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([A-Z\d]{2})([A\d])$/;

/** Regla pura del RFC, compartida por los validadores de Reactive Forms y Signal Forms. */
export function isRfc(value: string): boolean {
    return RFC_REGEX.test(value.trim().toUpperCase());
}

export abstract class ValidatorsCustom {
    /** RFC mexicano (persona fisica o moral). No valida si esta vacio; combinar con Validators.required. */
    public static rfc(control: AbstractControl): ValidationErrors | null {
        const v = (control.value as string | null)?.trim().toUpperCase();
        if (!v) return null;
        return isRfc(v) ? null : { rfc: { actual: v } };
    }

    /** Solo letras y espacios. */
    public static onlyLetters(control: AbstractControl): ValidationErrors | null {
        const v = control.value as string | null;
        if (!v) return null;
        return /^[\p{L}\s]+$/u.test(v) ? null : { onlyLetters: true };
    }

    /** Prohibe ciertas palabras. */
    public static forbiddenWords(words: string[]): ValidatorFn {
        return (control) => {
            const v = (control.value as string | null)?.toLowerCase() ?? '';
            const found = words.find(w => v.includes(w.toLowerCase()));
            return found ? { forbiddenWords: { word: found } } : null;
        };
    }
}

// * Un solo lugar con todos los mensajes: los de Angular y los personalizados.
export const ERROR_MESSAGES: ErrorMessages = {
    required:       () => 'Campo obligatorio',
    requiredTrue:   () => 'Debes aceptar este campo',
    email:          () => 'Correo no válido',
    minlength:      e => `Mínimo ${e.requiredLength} caracteres`,
    maxlength:      e => `Máximo ${e.requiredLength} caracteres`,
    min:            e => `El valor mínimo es ${e.min}`,
    max:            e => `El valor máximo es ${e.max}`,
    pattern:        () => 'Formato no válido',
    // [Signal Forms] Sus built-in usan camelCase y otras propiedades ({ kind: 'minLength', minLength: 3 }).
    minLength:      e => `Mínimo ${e.minLength} caracteres`,
    maxLength:      e => `Máximo ${e.maxLength} caracteres`,
    minDate:        e => `La fecha mínima es ${e.minDate.toLocaleDateString()}`,
    maxDate:        e => `La fecha máxima es ${e.maxDate.toLocaleDateString()}`,
    // * Personalizados.
    rfc:           () => 'RFC no válido',
    onlyLetters:    () => 'Solo se admiten letras',
    forbiddenWords: e => `La palabra "${e.word}" no está permitida`,
};
