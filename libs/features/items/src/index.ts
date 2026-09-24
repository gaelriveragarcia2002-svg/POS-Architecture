// Superficie pública de @pos-architecture/items.
// Exporta domain (entidades y puertos) y application (casos de uso).
// Los use-cases son puros (input -> Observable<output>): no manejan estado
// reactivo. El estado de UI (items cargados, loading, error) es responsabilidad
// de cada app consumidora, igual que cada app implementa su propio adaptador
// para ItemsRepository. NUNCA exportes adapters de infraestructura desde aca.

// domain
export * from './lib/domain/item';
export * from './lib/domain/ports/items.repository';

// application
export * from './lib/application/use-case/list-items.use-case';
export * from './lib/application/use-case/add-item.use-case';
