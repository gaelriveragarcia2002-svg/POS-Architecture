import { Injectable } from '@angular/core';
import { ReportJob } from '../domain/report-job';
import { ReportJobStorage } from '../domain/report-job-storage';
import { safeLocalStorage } from './safe-storage';

const KEY = 'report-jobs';

/** Nivel 2: los trabajos sobreviven a la recarga (misma pestaña y origen). */
@Injectable()
export class LocalStorageReportJobStorage extends ReportJobStorage {

    // * Metodos del storage.
    load(): ReportJob[] {
        try {
            const raw = safeLocalStorage()?.getItem(KEY);
            const parsed: unknown = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? (parsed as ReportJob[]) : [];
        } catch {
            return [];
        }
    }

    save(jobs: ReportJob[]): void {
        try {
            safeLocalStorage()?.setItem(KEY, JSON.stringify(jobs));
        } catch {
            // Cuota llena o acceso bloqueado: la lista sigue en memoria.
        }
    }
}
