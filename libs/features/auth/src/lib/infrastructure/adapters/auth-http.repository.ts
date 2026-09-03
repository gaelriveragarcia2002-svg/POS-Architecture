import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";

import { API_CONFIG, ApiResponse } from "@pos-architecture/core";
import { AuthRefresh } from "../../domain/auth-refresh";
import { AuthResult } from "../../domain/auth-result";
import { Credentials } from "../../domain/credentials";
import { CredentialsRegister } from "../../domain/credentials-register";
import { AuthenticatedUser } from "../../domain/auth-user";
import { AuthRepository } from "../../domain/ports/auth-repository";
import { Refresh } from "../../domain/refresh";
import { MeResponseDTO } from "../DTO/me-response.dto";
import { RefreshResponseDTO } from "../DTO/refresh-response.dto";
import { VerificationResponseDTO } from "../DTO/verification-response.dto";
import { AuthResultMapper } from "../mappers/auth-result.mapper";
import { MeResultMapper } from "../mappers/me-result.mapper";
import { RefreshResultMapper } from "../mappers/refresh-result.mapper";

/* FILE: features/auth/infrastructure/auth.http.repository.ts
 * Implementa el puerto, llama al HTTP y DESENVUELVE el DTO a dominio. */
@Injectable()
export class HttpAuthRepository extends AuthRepository {

    // * Inyeccion de dependencias.
    private http = inject(HttpClient);
    private config = inject(API_CONFIG);   // sustituye a `environment`

    // * Metodos de la clase.
    public login(credentials: Credentials): Observable<AuthResult> {
        // * Credentials: 'include' hace que las cookies del servidor en el navegador pero para que persista 
        return this.http
        .post<VerificationResponseDTO>(`${this.config.apiUrl}/auth/login`, credentials, { withCredentials: true })
        .pipe(map((res) => AuthResultMapper.toAuthResult(res)));
    }

    public me(): Observable<AuthenticatedUser> {
        return this.http
        .get<MeResponseDTO>(`${this.config.apiUrl}/auth/me`)
        .pipe(map((res) => MeResultMapper.toAuthenticatedUser(res)));
    }

    public refresh(refresh: Refresh): Observable<AuthRefresh> {
        return this.http
        .post<RefreshResponseDTO>(`${this.config.apiUrl}/auth/refresh`, refresh)
        .pipe(map((res) => RefreshResultMapper.toAuthRefresh(res)));
    }

    public register(data: CredentialsRegister): Observable<AuthResult> {
        return this.http
        .post<ApiResponse<VerificationResponseDTO>>(`${this.config.apiUrl}/register`, data)
        .pipe(map((res) => AuthResultMapper.toAuthResult(res.data)));
    }
    
    public logout(): Observable<void> {
        return this.http.post<void>(`${this.config.apiUrl}/logout`, {});
    }
}