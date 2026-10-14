import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportDefinition } from '../domain/reports-definition';
import { ReportGateway } from '../domain/reports-gateway';


/** Caso de uso: ejecutar un reporte con defaults y overrides.
 *  No es `providedIn: 'root'`: lo registra `provideReporting()` para que se cree
 *  en el mismo injector que su gateway y respete el endpoint de ruta/componente. */
@Injectable()
export class ReportService {
  
    // * Inyeccion de dependencias.
    private gateway = inject(ReportGateway);

    // * Ejecuta un reporte con defaults y overrides.
    public run(report: ReportDefinition, formValue: unknown): Observable<Blob> {
        
        // `report` va DESPUÉS del spread para que el id siempre gane
        const payload = { ...report.toPayload(formValue), report: report.id };

        // Prioridad para obtener el archivo (de mayor a menor):

        // 1) `generate`: el reporte se encarga de todo (CSV en el cliente, otra API, lo que sea).
        //    Si existe, no se toca el gateway HTTP ni ningun endpoint.
        if (report.generate) return report.generate(payload);

        // 2) `endpoint` del reporte: POST a su URL personalizada.
        // 3) Si el reporte no declara `endpoint` llega `undefined` y el gateway
        //    usa REPORT_ENDPOINT (`endpoint ?? defaultEndpoint`).
        return this.gateway.send(report.endpoint, payload);
    }
}
