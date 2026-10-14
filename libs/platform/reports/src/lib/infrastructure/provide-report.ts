import { EnvironmentProviders, Provider, inject, provideAppInitializer } from "@angular/core";
import { ReportJobsStore } from "../application/report-jobs.store";
import { ReportService } from "../application/reports.service";
import { ReportJobGateway } from "../domain/report-job-gateway";
import { ReportJobStorage } from "../domain/report-job-storage";
import { ReportJobTracker } from "../domain/report-job-tracker";
import { ReportGateway } from "../domain/reports-gateway";
import { FakeReportJobGateway } from "./fake-report-job.gateway";
import { HttpReportGateway } from "./http-reports.gateway";
import { LocalStorageReportJobStorage } from "./local-storage-report-job.storage";
import { MemoryReportJobStorage } from "./memory-report-job.storage";
import { PollingReportJobTracker } from "./polling-report-job.tracker";
import { REPORT_ENDPOINT } from "./reports-endpoint.token";

export interface ReportingOptions {
  defaultEndpoint?: string;
}

/** Se llama en app.config.ts (global) y, opcionalmente, en una ruta o componente para sobreescribir el endpoint. */
export const provideReporting = (options: ReportingOptions = {}): Provider[] => [
  { provide: ReportGateway, useClass: HttpReportGateway },
  ReportService,
  ...(options.defaultEndpoint
    ? [{ provide: REPORT_ENDPOINT, useValue: options.defaultEndpoint }]
    : []),
];

export interface ReportJobsOptions {
  /** 'memory' (nivel 1): se pierden al recargar. 'local' (nivel 2): sobreviven a la recarga. */
  persistence?: 'memory' | 'local';
}

/** Reportes asincronos (cola + polling). Por ahora con el backend simulado; luego se cambia por el adaptador HTTP. */
export const provideReportJobs = (options: ReportJobsOptions = {}): (Provider | EnvironmentProviders)[] => [
  { provide: ReportJobGateway, useClass: FakeReportJobGateway },
  { provide: ReportJobTracker, useClass: PollingReportJobTracker },
  {
    provide: ReportJobStorage,
    useClass: options.persistence === 'memory' ? MemoryReportJobStorage : LocalStorageReportJobStorage,
  },
  // Instancia el store al arrancar para que retome los trabajos guardados aunque ninguna pantalla lo inyecte.
  provideAppInitializer(() => {
    inject(ReportJobsStore);
  }),
];
