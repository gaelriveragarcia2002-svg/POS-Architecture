import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { ReportJobStatus } from '../domain/report-job';
import { ReportJobGateway } from '../domain/report-job-gateway';
import { safeLocalStorage } from './safe-storage';

const QUEUED_MS = 1500;
const RUNNING_MS = 8000;
const KEY = 'fake-report-backend';

interface FakeJob {
  readonly startedAt: number;
  readonly payload: unknown;
}

/**
 * Backend simulado: queued -> running (0..100) -> done.
 * Guarda sus trabajos en localStorage para imitar a un backend real, que sigue
 * conociendo el trabajo despues de que el usuario recargue la pagina. Se
 * sustituye por un adaptador HTTP con el mismo contrato.
 */
@Injectable()
export class FakeReportJobGateway extends ReportJobGateway {

    // * Metodos del gateway.
    submit(_endpoint: string | undefined, payload: unknown): Observable<string> {
        const jobs = this.read();
        const id = `job-${Date.now().toString(36)}`;
        jobs[id] = { startedAt: Date.now(), payload };
        this.write(jobs);
        return of(id);
    }

    status(jobId: string): Observable<ReportJobStatus> {
        const job = this.read()[jobId];
        if (!job) return throwError(() => new Error(`Trabajo ${jobId} no encontrado.`));

        const elapsed = Date.now() - job.startedAt;
        if (elapsed < QUEUED_MS) return of({ state: 'queued' });

        const progress = Math.min(100, Math.round(((elapsed - QUEUED_MS) / RUNNING_MS) * 100));
        return of(progress >= 100 ? { state: 'done', progress: 100 } : { state: 'running', progress });
    }

    download(jobId: string): Observable<Blob> {
        const job = this.read()[jobId];
        if (!job) return throwError(() => new Error(`Trabajo ${jobId} no encontrado.`));

        const content = `Reporte simulado ${jobId}\n${JSON.stringify(job.payload, null, 2)}\n`;
        return of(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    }

    // * Persistencia del backend simulado.
    private read(): Record<string, FakeJob> {
        try {
            const raw = safeLocalStorage()?.getItem(KEY);
            return raw ? (JSON.parse(raw) as Record<string, FakeJob>) : {};
        } catch {
            return {};
        }
    }

    private write(jobs: Record<string, FakeJob>): void {
        try {
            safeLocalStorage()?.setItem(KEY, JSON.stringify(jobs));
        } catch {
            // Sin acceso a localStorage: el backend simulado no recordara el trabajo.
        }
    }
}
