import { Provider } from "@angular/core";
import { ReportGateway } from "../domain/reports-gateway";
import { HttpReportGateway } from "./http-reports.gateway";
import { REPORT_ENDPOINT } from "./reports-endpoint.token";

export interface ReportingOptions {
  defaultEndpoint?: string;
}

/** Se llama una sola vez en app.config.ts. */
export const provideReporting = (options: ReportingOptions = {}): Provider[] => [
  { provide: ReportGateway, useClass: HttpReportGateway },
  ...(options.defaultEndpoint
    ? [{ provide: REPORT_ENDPOINT, useValue: options.defaultEndpoint }]
    : []),
];
