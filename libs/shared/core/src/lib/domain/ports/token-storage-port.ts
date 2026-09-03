export type TokenType = 'access-token' | 'refresh-token';

// Puerto tecnico sin significado de negocio propio: se inyecta directo en
// casos de uso (login/register/refresh), nunca en un caso de uso propio ni en presentation.
export abstract class TokenStoragePort {
  abstract get(type: TokenType): string | null;
  abstract save(type: TokenType, token: string): void;
  abstract clear(type: TokenType): void;
  abstract clearAll(): void;
}
