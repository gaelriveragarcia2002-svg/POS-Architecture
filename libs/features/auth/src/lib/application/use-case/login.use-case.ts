import { Injectable, inject } from "@angular/core";
import { Observable, map, tap } from "rxjs";
import { SessionStore } from "@pos-architecture/core";
import { UseCase } from "@pos-architecture/core";
import { TokenStoragePort } from "@pos-architecture/core";
import { AuthResult } from "../../domain/auth-result";
import { AuthenticatedUser } from "../../domain/auth-user";
import { Credentials } from "../../domain/credentials";
import { AuthRepository } from "../../domain/ports/auth-repository";

@Injectable({ providedIn: 'root' })
export class LoginUseCase implements UseCase<Credentials, AuthenticatedUser> {

    // * Inyeccion de dependencias.
    private repo = inject(AuthRepository);       // puerto (resuelto a HttpAuthRepository).
    private session = inject(SessionStore);      // core.
    private tokens = inject(TokenStoragePort);   // core.

    // * Metodo execute del caso de uso.
    public execute(credentials: Credentials): Observable<AuthenticatedUser> {
        return this.repo.login(credentials).pipe(
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
