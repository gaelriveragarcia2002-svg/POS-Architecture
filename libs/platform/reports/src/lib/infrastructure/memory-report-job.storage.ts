import { Injectable } from '@angular/core';
import { ReportJob } from '../domain/report-job';
import { ReportJobStorage } from '../domain/report-job-storage';

/** Nivel 1: no persiste nada; los trabajos se pierden al recargar. */
@Injectable()
export class MemoryReportJobStorage extends ReportJobStorage {
    load(): ReportJob[] {
        return [];
    }

    save(): void {
        // Sin persistencia.
    }
}
