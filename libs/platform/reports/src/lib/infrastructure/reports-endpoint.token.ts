import { InjectionToken } from "@angular/core";

export const REPORT_ENDPOINT = new InjectionToken<string>('REPORT_ENDPOINT', {
  providedIn: 'root',
  factory: () => '/api/reports',
});
