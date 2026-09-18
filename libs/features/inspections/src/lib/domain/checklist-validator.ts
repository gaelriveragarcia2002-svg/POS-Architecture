import { INSPECTION_CHECKLIST } from './checklist';
import { InspectionAnswers } from './inspection';

export interface ChecklistValidationError {
  fieldId: string;
  message: string;
}

/**
 * Regla de negocio pura: todo campo marcado `required` en el checklist debe
 * tener respuesta. Vive en domain (no en el use-case ni en el adapter)
 * porque es una regla del negocio, no un detalle de Angular ni de SQLite —
 * y es exactamente el tipo de validación que puede correr local, sin red:
 * la autoridad del servidor entra recién con reglas que dependen de estado
 * global (permisos, "este sitio ya tiene inspección hoy", etc.).
 */
export function validateAnswers(answers: InspectionAnswers): ChecklistValidationError[] {
  const errors: ChecklistValidationError[] = [];

  for (const field of INSPECTION_CHECKLIST) {
    const value = answers[field.id];
    const isMissing = value === undefined || value === null || value === '';

    if (field.required && isMissing) {
      errors.push({ fieldId: field.id, message: `"${field.label}" es obligatorio.` });
    }
  }

  return errors;
}
