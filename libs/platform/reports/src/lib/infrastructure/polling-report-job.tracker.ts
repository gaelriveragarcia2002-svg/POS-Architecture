import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, switchMap, takeWhile, timer } from 'rxjs';
import { ReportJobStatus, isFinalJobState } from '../domain/report-job';
import { ReportJobGateway } from '../domain/report-job-gateway';
import { ReportJobTracker } from '../domain/report-job-tracker';

const POLLING_MS = 1000;

/** Sigue un trabajo consultando su estado cada `POLLING_MS` hasta que es final. */
@Injectable()
export class PollingReportJobTracker extends ReportJobTracker {

    // * Inyeccion de dependencias.
    private gateway = inject(ReportJobGateway);

    // * Metodos del tracker.
    track(jobId: string): Observable<ReportJobStatus> {
        return timer(0, POLLING_MS).pipe(
            switchMap(() =>
                this.gateway.status(jobId).pipe(
                    catchError((): Observable<ReportJobStatus> => of({ state: 'failed', error: 'Se perdio el seguimiento del trabajo.' })),
                ),
            ),
            // `true`: el estado final tambien se emite antes de completar.
            takeWhile((status) => !isFinalJobState(status.state), true),
        );
    }
}
