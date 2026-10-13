import { NonNullableFormBuilder, Validators } from '@angular/forms';

/**
 * Bloques de campos reutilizables (composición, no herencia).
 * Regla de tres: aquí solo va lo que ya se repite en varios reportes.
 */
export const dateRangeControls = (fb: NonNullableFormBuilder) => ({
  from: fb.control('', Validators.required),
  to: fb.control('', Validators.required),
});

export const formatControl = (fb: NonNullableFormBuilder) => ({
  format: fb.control<'pdf' | 'xlsx'>('pdf'),
});

