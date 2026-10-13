import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ReportDefinition } from '../domain/reports-definition';
import { ReportGateway } from '../domain/reports-gateway';


/** Caso de uso: ejecutar un reporte con defaults y overrides. */
@Injectable({ providedIn: 'root' })
export class ReportService {
  
    // * Inyeccion de dependencias.
    private gateway = inject(ReportGateway);

    // * Ejecuta un reporte con defaults y overrides.
    public run(report: ReportDefinition, formValue: unknown): Observable<Blob> {
        
        // `report` va DESPUÉS del spread para que el id siempre gane
        const payload = { ...report.toPayload(formValue), report: report.id };

        // 1) Override completo
        if (report.generate) return report.generate(payload);

        // 2) Override de URL (endpoint) o 3) endpoint por defecto (lo resuelve el gateway)
        return this.gateway.send(report.endpoint, payload);
    }
}
