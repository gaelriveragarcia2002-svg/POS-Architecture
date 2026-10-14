import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { ReportJobStatus } from '../domain/report-job';
import { ReportJobGateway } from '../domain/report-job-gateway';

const QUEUED_MS = 1500;
const RUNNING_MS = 8000;

interface FakeJob {
  readonly startedAt: number;
  readonly payload: unknown;
}

/**
 * Backend simulado en memoria: queued -> running (0..100) -> done.
 * Sirve para validar el modelo, el store y la UI sin backend; se sustituye por
 * un adaptador HTTP con el mismo contrato.
 */
@Injectable()
export class FakeReportJobGateway extends ReportJobGateway {

    // * Estado del backend simulado.
    private readonly jobs = new Map<string, FakeJob>();
    private nextId = 1;

    // * Metodos del gateway.
    submit(_endpoint: string | undefined, payload: unknown): Observable<string> {
        const id = `job-${this.nextId++}`;
        this.jobs.set(id, { startedAt: Date.now(), payload });
        return of(id);
    }

    status(jobId: string): Observable<ReportJobStatus> {
        const job = this.jobs.get(jobId);
        if (!job) return throwError(() => new Error(`Trabajo ${jobId} no encontrado.`));

        const elapsed = Date.now() - job.startedAt;
        if (elapsed < QUEUED_MS) return of({ state: 'queued' });

        const progress = Math.min(100, Math.round(((elapsed - QUEUED_MS) / RUNNING_MS) * 100));
        return of(progress >= 100 ? { state: 'done', progress: 100 } : { state: 'running', progress });
    }

    download(jobId: string): Observable<Blob> {
        const job = this.jobs.get(jobId);
        if (!job) return throwError(() => new Error(`Trabajo ${jobId} no encontrado.`));

        const content = `Reporte simulado ${jobId}\n${JSON.stringify(job.payload, null, 2)}\n`;
        return of(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    }
}
