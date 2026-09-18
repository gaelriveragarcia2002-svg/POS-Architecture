// Superficie pública de @pos-architecture/items.
// Exporta domain (entidades y puertos) y application (casos de uso, store).
// NUNCA exportes adapters de infraestructura desde aca: cada app (web,
// mobile...) implementa su propio adaptador para ItemsRepository.

// domain
export * from './lib/domain/item';
export * from './lib/domain/ports/items.repository';

// application
export * from './lib/application/store/items.store';
export * from './lib/application/use-case/list-items.use-case';
export * from './lib/application/use-case/add-item.use-case';
