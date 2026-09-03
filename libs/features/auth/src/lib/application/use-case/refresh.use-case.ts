import { inject, Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { UseCase } from "@pos-architecture/core";
import { TokenStoragePort } from "@pos-architecture/core";
import { AuthRefresh } from "../../domain/auth-refresh";
import { AuthRepository } from "../../domain/ports/auth-repository";
import { Refresh } from "../../domain/refresh";


@Injectable({ providedIn: 'root' })
export class RefreshUseCase implements UseCase<Refresh, AuthRefresh> {

    // * Inyeccion de dependencias.
    private repo = inject(AuthRepository);
    private tokens = inject(TokenStoragePort);

    // * Metodo del caso de uso.
    public execute(input: Refresh = {}): Observable<AuthRefresh> {
        const refresh: Refresh = {
            refreshToken: input.refreshToken ?? this.tokens.get('refresh-token') ?? undefined,
            expiresInMins: input.expiresInMins,
        };
        return this.repo.refresh(refresh)
        .pipe(
            tap((result) => {
                this.tokens.save('access-token', result.accessToken);
                this.tokens.save('refresh-token', result.refreshToken);
            }),
        );
    }
}