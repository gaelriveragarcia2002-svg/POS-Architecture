import { Observable } from 'rxjs';
import { ReportJobStatus } from './report-job';

/**
 * Puerto para reportes asincronos (guia del contrato que debe ofrecer el backend):
 *  - submit:   POST  -> 202 + jobId
 *  - status:   GET   /jobs/{id} -> { state, progress?, error? }
 *  - download: GET   /jobs/{id}/result -> Blob (solo cuando state === 'done')
 */
export abstract class ReportJobGateway {
  abstract submit(endpoint: string | undefined, payload: unknown): Observable<string>;
  abstract status(jobId: string): Observable<ReportJobStatus>;
  abstract download(jobId: string): Observable<Blob>;
}
