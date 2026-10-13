# reports

Capacidad de plataforma "reportes", compartible entre cualquier app del
workspace. No es una feature de negocio: cada feature define sus reportes
(`ReportFormDefinition`) y se los pasa a `<app-report-runner [reports]="...">`.

- `domain/`: `ReportDefinition` y el puerto `ReportGateway`.
- `application/`: `ReportService` (ejecuta un reporte: `generate` > `endpoint` > endpoint por defecto).
- `infrastructure/`: adaptador HTTP del gateway, `REPORT_ENDPOINT` y `provideReporting()`.
- `presentation/`: `ReportRunnerComponent`, `ReportFormDefinition` y bloques de campos reutilizables (`shared-fields`).

La app registra la capacidad una sola vez con `provideReporting()` en `app.config.ts`.

## Running unit tests

Run `nx test reports` to execute the unit tests.
