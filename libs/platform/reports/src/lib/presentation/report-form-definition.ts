import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { ReportDefinition } from '../domain/reports-definition';

/** Un reporte + el formulario de filtros con el que el runner lo pinta. */
export interface ReportFormDefinition<TForm = any, TPayload = any>
  extends ReportDefinition<TForm, TPayload> {
  buildForm(fb: NonNullableFormBuilder): FormGroup;
}
