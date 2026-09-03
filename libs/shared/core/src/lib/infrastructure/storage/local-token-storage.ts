import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { TokenStoragePort, TokenType } from "../../domain/ports/token-storage-port";

@Injectable({ providedIn: 'root' })
export class LocalTokenStorage extends TokenStoragePort {

  // * Atributos del servicio.
  private readonly TOKEN_TYPES: TokenType[] = ['access-token', 'refresh-token'];
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  public get(type: TokenType): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(type);
  }

  public save(type: TokenType, token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(type, token);
  }

  public clear(type: TokenType): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(type);
  }

  public clearAll(): void {
    this.TOKEN_TYPES.forEach((type) => this.clear(type));
  }
}
