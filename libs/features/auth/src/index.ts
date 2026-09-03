// Superficie pública de @pos-architecture/auth.
// Exporta presentation, casos de uso, tipos de domain y los providers de DI.
// NUNCA exportes adapters ni DTOs: son detalle de implementación.

// domain
export * from './lib/domain/auth-refresh';
export * from './lib/domain/auth-result';
export * from './lib/domain/auth-user';
export * from './lib/domain/credentials';
export * from './lib/domain/credentials-register';
export * from './lib/domain/ports/auth-repository';
export * from './lib/domain/refresh';

// application
export * from './lib/application/use-case/login.use-case';
export * from './lib/application/use-case/me.use-case';
export * from './lib/application/use-case/refresh.use-case';
export * from './lib/application/use-case/register.use-case';

// infrastructure: solo el cableado de DI (puerto -> adaptador)
export * from './lib/infrastructure/providers/auth-providers';

// presentation
export * from './lib/presentation/components/global-login.component';
