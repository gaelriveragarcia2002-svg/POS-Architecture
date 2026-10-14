import { Component, inject } from '@angular/core';
import { ReportJobsStore } from '../application/report-jobs.store';
import { ReportJob } from '../domain/report-job';
import { downloadBlob } from './download-blob';

/** Lista los reportes asincronos con su estado y progreso. */
@Component({
  selector: 'app-report-jobs-panel',
  standalone: true,
  template: `
    @for (job of store.jobs(); track job.id) {
      <div>
        <strong>{{ job.label }}</strong>
        <span> - {{ job.state }}</span>
        @if (job.state === 'running') {
          <progress max="100" [value]="job.progress ?? 0"></progress>
          <span>{{ job.progress ?? 0 }}%</span>
        }
        @if (job.state === 'done') {
          <button type="button" (click)="download(job)">Descargar</button>
        }
        @if (job.error) {
          <span>{{ job.error }}</span>
        }
        @if (job.state === 'done' || job.state === 'failed') {
          <button type="button" (click)="store.dismiss(job.id)">Quitar</button>
        }
      </div>
    } @empty {
      <p>Sin reportes en segundo plano.</p>
    }
  `,
})
export class ReportJobsPanelComponent {

    // * Inyeccion de dependencias.
    protected store = inject(ReportJobsStore);

    // * Metodos del componente.
    protected download(job: ReportJob) {
        this.store.download(job.id).subscribe((blob) => downloadBlob(blob, `${job.reportId}.${job.extension}`));
    }
}
