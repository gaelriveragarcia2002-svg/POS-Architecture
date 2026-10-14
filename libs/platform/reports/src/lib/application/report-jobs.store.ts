import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, switchMap, takeWhile, tap, timer } from 'rxjs';
import { ReportJob, ReportJobStatus, isFinalJobState } from '../domain/report-job';
import { ReportJobGateway } from '../domain/report-job-gateway';
import { ReportDefinition } from '../domain/reports-definition';

const POLLING_MS = 1000;

/**
 * Nivel 1: trabajos en memoria con polling. Es del root para que un trabajo
 * siga vivo al navegar entre rutas; se pierde al recargar la pagina.
 */
@Injectable({ providedIn: 'root' })
export class ReportJobsStore {

    // * Inyeccion de dependencias.
    private gateway = inject(ReportJobGateway);

    // * Estado.
    private readonly _jobs = signal<ReportJob[]>([]);
    public readonly jobs = this._jobs.asReadonly();

    // * Encola un reporte: lo envia al backend y empieza a consultar su estado.
    public enqueue(report: ReportDefinition, formValue: unknown): void {
        const payload = { ...report.toPayload(formValue), report: report.id };

        this.gateway.submit(report.endpoint, payload).subscribe({
            next: (id) => {
                this.upsert({
                    id,
                    reportId: report.id,
                    label: report.label,
                    extension: report.extension ?? 'bin',
                    state: 'queued',
                });
                this.track(id);
            },
            error: () => {
                this.upsert({
                    id: `error-${Date.now()}`,
                    reportId: report.id,
                    label: report.label,
                    extension: report.extension ?? 'bin',
                    state: 'failed',
                    error: 'No se pudo enviar el reporte.',
                });
            },
        });
    }

    // * Descarga el resultado de un trabajo terminado.
    public download(jobId: string): Observable<Blob> {
        return this.gateway.download(jobId);
    }

    // * Quita un trabajo terminado de la lista.
    public dismiss(jobId: string): void {
        this._jobs.update((jobs) => jobs.filter((j) => j.id !== jobId));
    }

    // * Polling: consulta el estado hasta que llega a uno final (el final tambien se emite).
    private track(jobId: string): void {
        timer(0, POLLING_MS)
            .pipe(
                switchMap(() =>
                    this.gateway.status(jobId).pipe(
                        catchError((): Observable<ReportJobStatus> => of({ state: 'failed', error: 'Se perdio el seguimiento del trabajo.' })),
                    ),
                ),
                tap((status) => this.patch(jobId, status)),
                takeWhile((status) => !isFinalJobState(status.state), true),
            )
            .subscribe();
    }

    private upsert(job: ReportJob): void {
        this._jobs.update((jobs) => [job, ...jobs]);
    }

    private patch(jobId: string, status: ReportJobStatus): void {
        this._jobs.update((jobs) => jobs.map((j) => (j.id === jobId ? { ...j, ...status } : j)));
    }
}
