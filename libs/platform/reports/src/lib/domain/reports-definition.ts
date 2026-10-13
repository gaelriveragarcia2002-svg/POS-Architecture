import { Observable } from "rxjs";

export interface ReportDefinition<TForm = any, TPayload = any> {
  readonly id: string;
  readonly label: string;
  readonly endpoint?: string;
  toPayload(value: TForm): TPayload;
  generate?(payload: TPayload): Observable<Blob>;
}


