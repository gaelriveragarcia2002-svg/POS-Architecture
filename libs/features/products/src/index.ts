// Superficie pública de @pos-architecture/products.
// Exporta domain (entidades y puertos) y application (casos de uso).
// Los use-cases son puros (input -> Observable<output>): no manejan estado
// reactivo. NUNCA exportes adapters de infraestructura desde aca: cada app
// implementa su propio adaptador para ProductsRepository.

// domain
export * from './lib/domain/product';
export * from './lib/domain/ports/products.repository';

// application
export * from './lib/application/use-case/list-products.use-case';
