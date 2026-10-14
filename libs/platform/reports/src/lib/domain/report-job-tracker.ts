import { Observable } from 'rxjs';
import { ReportJobStatus } from './report-job';

/**
 * Puerto: como se sigue un trabajo hasta que termina. Emite cada estado y completa
 * tras emitir el final (done | failed). Polling hoy; SSE/WebSocket mas adelante.
 */
export abstract class ReportJobTracker {
  abstract track(jobId: string): Observable<ReportJobStatus>;
}
