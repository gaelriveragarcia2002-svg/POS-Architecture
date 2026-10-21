// [Signal Forms] Archivo opcional: requiere Angular 21+. Para proyectos sin Signal Forms,
// borrar este archivo y su export en src/index.ts.
import { PathKind, SchemaPath, SchemaPathRules, validate } from '@angular/forms/signals';
import { isRfc } from './validators-custom';

interface ValidatorOptions {
    /** Mensaje fijo para este campo; si no se pasa, el wrapper usa ERROR_MESSAGES. */
    message?: string;
}

// * Validadores personalizados para esquemas de Signal Forms. Emiten los mismos 'kind'
// * que ValidatorsCustom, asi que comparten mensajes en ERROR_MESSAGES.
export abstract class SignalValidatorsCustom {
    /** RFC mexicano (persona fisica o moral). No valida si esta vacio; combinar con required(). */
    public static rfc<TPathKind extends PathKind = PathKind.Root>(
        path: SchemaPath<string, SchemaPathRules.Supported, TPathKind>,
        options?: ValidatorOptions,
    ): void {
        validate(path, ({ value }) => {
            const v = value().trim().toUpperCase();
            if (!v || isRfc(v)) return null;
            // Se arma fuera del return para conservar 'actual' (el tipo solo declara kind/message).
            const error = { kind: 'rfc', message: options?.message, actual: v };
            return error;
        });
    }
}
