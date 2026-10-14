import { Injectable, afterNextRender, effect, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportJob, isFinalJobState } from '../domain/report-job';
import { ReportJobGateway } from '../domain/report-job-gateway';
import { ReportJobStorage } from '../domain/report-job-storage';
import { ReportJobTracker } from '../domain/report-job-tracker';
import { ReportDefinition } from '../domain/reports-definition';

/** Trabajos mas viejos que esto se descartan al restaurar (el backend ya no los conserva). */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Cola de reportes asincronos. Es del root para que un trabajo siga vivo al
 * navegar entre rutas. Con persistencia (nivel 2) tambien sobrevive a la
 * recarga: se restaura la lista guardada y se retoma el seguimiento de los
 * trabajos que aun no terminaron.
 */
@Injectable({ providedIn: 'root' })
export class ReportJobsStore {

    // * Inyeccion de dependencias.
    private gateway = inject(ReportJobGateway);
    private tracker = inject(ReportJobTracker);
    private storage = inject(ReportJobStorage);

    // * Estado.
    private readonly _jobs = signal<ReportJob[]>([]);
    public readonly jobs = this._jobs.asReadonly();

    // * Hasta restaurar no se guarda: si no, la lista vacia inicial pisaria lo guardado.
    private restored = false;

    constructor() {
        // Escucha el cambio de los jobs para poder guardarlos en el storage.
        effect(() => {
            const jobs = this._jobs();
            if (this.restored) this.storage.save(jobs);
        });

        // Se restaura despues del primer render para que el cliente pinte lo mismo que el SSR (hidratacion).
        afterNextRender(() => this.restore());
    }

    // * Encola un reporte: lo envia al backend y empieza a consultar su estado.
    public enqueue(report: ReportDefinition, formValue: unknown): void {
        const payload = { ...report.toPayload(formValue), report: report.id };

        this.gateway.submit(report.endpoint, payload).subscribe({
            next: (id) => {
                this.upsert({ ...this.baseJob(report, id), state: 'queued' });
                this.track(id);
            },
            error: () => {
                this.upsert({
                    ...this.baseJob(report, `error-${Date.now()}`),
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

    // * Restaura los trabajos guardados y retoma el seguimiento de los no terminados.
    private restore(): void {
        const now = Date.now();
        const saved = this.storage.load().filter((j) => now - j.createdAt < MAX_AGE_MS);

        this.restored = true;
        this._jobs.update((current) => [...current, ...saved.filter((s) => !current.some((c) => c.id === s.id))]);

        saved.filter((j) => !isFinalJobState(j.state)).forEach((j) => this.track(j.id));
    }

    private track(jobId: string): void {
        this.tracker.track(jobId).subscribe((status) => this.patch(jobId, status));
    }

    private baseJob(report: ReportDefinition, id: string): Omit<ReportJob, 'state'> {
        return {
            id,
            reportId: report.id,
            label: report.label,
            extension: report.extension ?? 'bin',
            createdAt: Date.now(),
        };
    }

    private upsert(job: ReportJob): void {
        this._jobs.update((jobs) => [job, ...jobs]);
    }

    private patch(jobId: string, status: Pick<ReportJob, 'state' | 'progress' | 'error'>): void {
        this._jobs.update((jobs) => jobs.map((j) => (j.id === jobId ? { ...j, ...status } : j)));
    }
}
