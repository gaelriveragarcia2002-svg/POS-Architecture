import { Provider } from "@angular/core";
import { ReportService } from "../application/reports.service";
import { ReportJobGateway } from "../domain/report-job-gateway";
import { ReportGateway } from "../domain/reports-gateway";
import { FakeReportJobGateway } from "./fake-report-job.gateway";
import { HttpReportGateway } from "./http-reports.gateway";
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

/** Reportes asincronos (cola + polling). Por ahora con el backend simulado; luego se cambia por el adaptador HTTP. */
export const provideReportJobs = (): Provider[] => [
  { provide: ReportJobGateway, useClass: FakeReportJobGateway },
];
