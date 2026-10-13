import { Observable } from 'rxjs';

export abstract class ReportGateway {
  abstract send(endpoint: string | undefined, payload: unknown): Observable<Blob>;
}
