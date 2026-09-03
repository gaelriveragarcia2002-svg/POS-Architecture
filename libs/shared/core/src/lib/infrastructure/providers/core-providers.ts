import { Provider } from "@angular/core";
import { TokenStoragePort } from "../../domain/ports/token-storage-port";
import { LocalTokenStorage } from "../storage/local-token-storage";

// * Providers globales del core.
export const CORE_PROVIDERS: Provider[] = [
    { provide: TokenStoragePort, useExisting: LocalTokenStorage },
];
