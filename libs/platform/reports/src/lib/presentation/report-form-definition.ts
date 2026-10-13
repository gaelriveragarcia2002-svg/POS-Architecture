import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { ReportDefinition } from '../domain/reports-definition';

/** Un reporte + el formulario de filtros con el que el runner lo pinta. */
export interface ReportFormDefinition<TForm = any, TPayload = any>
  extends ReportDefinition<TForm, TPayload> {
  /** Extension del archivo descargado (si no, se usa el campo `format` o `bin`). */
  readonly extension?: string;
  buildForm(fb: NonNullableFormBuilder): FormGroup;
}
