import { Observable } from "rxjs";
import { AuthRefresh } from "../auth-refresh";
import { AuthResult } from "../auth-result";
import { AuthenticatedUser } from "../auth-user";
import { Credentials } from "../credentials";
import { CredentialsRegister } from "../credentials-register";
import { Refresh } from "../refresh";

export abstract class AuthRepository {
  abstract me(): Observable<AuthenticatedUser>;
  abstract login(credentials: Credentials): Observable<AuthResult>;
  abstract register(credentials: CredentialsRegister): Observable<AuthResult>;
  abstract refresh(refresh: Refresh): Observable<AuthRefresh>;
  abstract logout(): Observable<void>;
}