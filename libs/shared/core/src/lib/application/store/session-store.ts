import { computed, Injectable, signal } from "@angular/core";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class SessionStore {

  // * Atributos del store.
  private readonly _user = signal<SessionUser | null>(null);
  
  public readonly user = this._user.asReadonly();
  public readonly isAuthenticated = computed(() => this._user() !== null);
  public readonly roles = computed(() => this._user()?.roles ?? []);
  
  public setUser(user: SessionUser): void { this._user.set(user); }
  public clear(): void { this._user.set(null); }
  public hasRole(role: string): boolean { return this.roles().includes(role); }
}