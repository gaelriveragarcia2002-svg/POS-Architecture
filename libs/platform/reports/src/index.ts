// Superficie pública de @pos-architecture/reports.
// Capacidad de plataforma (no de negocio): define reportes, los ejecuta contra
// un gateway y pinta el formulario de filtros. Cada feature aporta sus propias
// definiciones de reporte (ReportFormDefinition) y se las pasa al runner.
// El adaptador HTTP no se exporta: la app lo registra con provideReporting().

// domain
export * from './lib/domain/reports-definition';
export * from './lib/domain/reports-gateway';

// application
export * from './lib/application/reports.service';

// infrastructure (el shell de la app necesita registrar esto)
export * from './lib/infrastructure/provide-report';
export * from './lib/infrastructure/reports-endpoint.token';

// presentation
export * from './lib/presentation/report-form-definition';
export * from './lib/presentation/report-runner.component';
export * from './lib/presentation/shared-fields';
