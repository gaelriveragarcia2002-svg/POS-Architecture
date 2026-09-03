import { Injectable, inject } from "@angular/core";
import { Observable, map, tap } from "rxjs";
import { SessionStore } from "@pos-architecture/core";
import { UseCase } from "@pos-architecture/core";
import { TokenStoragePort } from "@pos-architecture/core";
import { AuthResult } from "../../domain/auth-result";
import { AuthenticatedUser } from "../../domain/auth-user";
import { CredentialsRegister } from "../../domain/credentials-register";
import { AuthRepository } from "../../domain/ports/auth-repository";

@Injectable({ providedIn: 'root' })
export class RegisterUseCase implements UseCase<CredentialsRegister, AuthenticatedUser>  {

  // * Inyeccion de dependencias.
  private repo = inject(AuthRepository);
  private session = inject(SessionStore);
  private tokens = inject(TokenStoragePort);

  public execute(data: CredentialsRegister): Observable<AuthenticatedUser> {
    return this.repo.register(data).pipe(
      tap((result) => {
        this.tokens.save('access-token', result.accessToken);
        this.tokens.save('refresh-token', result.refreshToken);
      }),
      map((result) => this.toAuthenticatedUser(result)),
      tap((user) => this.session.setUser(user)),
    );
  }

  private toAuthenticatedUser(result: AuthResult): AuthenticatedUser {
    return {
      id: result.id,
      name: `${result.firstName} ${result.lastName}`,
      email: result.email,
      roles: [],
    };
  }
}
