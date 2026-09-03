import { Provider } from "@angular/core";
import { AuthRepository } from "../../domain/ports/auth-repository";
import { HttpAuthRepository } from "../adapters/auth-http.repository";

export const AUTH_PROVIDERS: Provider[] = [
    {useClass: HttpAuthRepository, provide: AuthRepository}
];