import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportGateway } from '../domain/reports-gateway';
import { REPORT_ENDPOINT } from './reports-endpoint.token';

/** Adaptador HTTP del puerto ReportGateway. */
@Injectable()
export class HttpReportGateway implements ReportGateway {
    
    // * Inyeccion de dependencias.
    private http = inject(HttpClient);
    private defaultEndpoint = inject(REPORT_ENDPOINT);

    constructor() {
        // * Este endpoint por default se puede modificar en funcion del provider declarado 
        // * con provideReporting() ya sea a nivel de ruta o componente.
        console.log('Endpoint por default:', this.defaultEndpoint);
    }

    // * Metodos del componente.
    send(endpoint: string | undefined, payload: unknown): Observable<Blob> {
        return this.http.post(endpoint ?? this.defaultEndpoint, payload, {
            responseType: 'blob',
        });
    }
}
