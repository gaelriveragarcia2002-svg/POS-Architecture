import { Observable } from "rxjs";

export interface ReportDefinition<TForm = any, TPayload = any> {
  readonly id: string;
  readonly label: string;
  readonly endpoint?: string;
  /** Extension del archivo descargado (si no, se usa el campo `format` o `bin`). */
  readonly extension?: string;
  toPayload(value: TForm): TPayload;
  generate?(payload: TPayload): Observable<Blob>;
}


