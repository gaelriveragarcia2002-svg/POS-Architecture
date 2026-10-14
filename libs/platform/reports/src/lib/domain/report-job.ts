/** Ciclo de vida de un reporte asincrono (el backend lo procesa en segundo plano). */
export type ReportJobState = 'queued' | 'running' | 'done' | 'failed';

/** Lo que responde el backend al consultar un trabajo. */
export interface ReportJobStatus {
  readonly state: ReportJobState;
  /** 0..100. Solo tiene sentido en `running`. */
  readonly progress?: number;
  readonly error?: string;
}

/** Trabajo tal como lo ve la UI: estado del backend + datos para pintarlo. */
export interface ReportJob extends ReportJobStatus {
  readonly id: string;
  readonly reportId: string;
  readonly label: string;
  /** Extension del archivo al descargar. */
  readonly extension: string;
  /** Epoch ms de cuando se encolo; permite descartar trabajos viejos al restaurar. */
  readonly createdAt: number;
}

export const isFinalJobState = (state: ReportJobState): boolean =>
  state === 'done' || state === 'failed';
