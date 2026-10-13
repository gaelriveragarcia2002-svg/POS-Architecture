import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportGateway } from '../domain/reports-gateway';
import { REPORT_ENDPOINT } from './reports-endpoint.token';

/** Adaptador HTTP del puerto ReportGateway. */
@Injectable()
export class HttpReportGateway extends ReportGateway {
    // * Inyeccion de dependencias.
    private http = inject(HttpClient);
    private defaultEndpoint = inject(REPORT_ENDPOINT);

    // * Metodos del componente.
    send(endpoint: string | undefined, payload: unknown): Observable<Blob> {
        return this.http.post(endpoint ?? this.defaultEndpoint, payload, {
            responseType: 'blob',
        });
    }
}
