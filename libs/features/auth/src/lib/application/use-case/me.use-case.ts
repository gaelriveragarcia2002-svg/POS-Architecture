import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UseCase } from "@pos-architecture/core";
import { AuthenticatedUser } from "../../domain/auth-user";
import { AuthRepository } from "../../domain/ports/auth-repository";

@Injectable({ providedIn: 'root' })
export class MeUseCase implements UseCase<void, AuthenticatedUser> {

    // * Inyeccion de dependencias.
    private repo = inject(AuthRepository);

    // * Metodo del caso de uso.
    public execute(): Observable<AuthenticatedUser> {
        return this.repo.me();
    }
}
