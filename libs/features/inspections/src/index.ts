// Superficie pública de @pos-architecture/inspections.
// Exporta domain (entidades, checklist, puerto) y application (casos de
// uso, store). NUNCA exportes adapters de infraestructura desde aca: cada
// app implementa su propio adaptador para InspectionsRepository.

// domain
export * from './lib/domain/checklist';
export * from './lib/domain/checklist-validator';
export * from './lib/domain/inspection';
export * from './lib/domain/ports/inspections.repository';

// application
export * from './lib/application/store/inspections.store';
export * from './lib/application/use-case/list-inspections.use-case';
export * from './lib/application/use-case/save-inspection.use-case';
