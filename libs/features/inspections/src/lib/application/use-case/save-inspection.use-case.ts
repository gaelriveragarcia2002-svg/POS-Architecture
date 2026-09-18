import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { UseCase } from '@pos-architecture/core';
import { ChecklistValidationError, validateAnswers } from '../../domain/checklist-validator';
import { Inspection, NewInspection } from '../../domain/inspection';
import { InspectionsRepository } from '../../domain/ports/inspections.repository';
import { InspectionsStore } from '../store/inspections.store';
import { ListInspectionsUseCase } from './list-inspections.use-case';

/**
 * Union discriminada en vez de tirar por el canal de error de rxjs: una
 * respuesta invalida es un resultado ESPERADO del negocio (el usuario dejo
 * un campo obligatorio vacio), no una excepcion — reservamos el error
 * channel para fallas reales (el repositorio/worker se cayo).
 */
export type SaveInspectionResult =
  | { ok: true; inspection: Inspection }
  | { ok: false; errors: ChecklistValidationError[] };

@Injectable({ providedIn: 'root' })
export class SaveInspectionUseCase implements UseCase<NewInspection, SaveInspectionResult> {

    // * Inyeccion de dependencias.
    private repo = inject(InspectionsRepository);
    private store = inject(InspectionsStore);
    private listInspections = inject(ListInspectionsUseCase);

    // * Metodo execute del caso de uso.
    public execute(input: NewInspection): Observable<SaveInspectionResult> {
        // Validacion local (sintactica/de negocio simple) ANTES de tocar el
        // repositorio: si falta un campo obligatorio, ni siquiera llegamos a
        // persistir. La validacion "de autoridad" (permisos, reglas que
        // dependen de estado global) es responsabilidad del servidor cuando
        // exista sync — esto no la reemplaza, la complementa.
        const errors = validateAnswers(input.answers);
        if (errors.length > 0) {
            return of({ ok: false, errors });
        }

        return this.repo.save(input).pipe(
            // Releemos tras guardar para que $inspections refleje el estado
            // real de la DB.
            switchMap((inspection) => this.listInspections.execute().pipe(map(() => inspection))),
            map((inspection): SaveInspectionResult => ({ ok: true, inspection })),
            catchError((e: unknown) => {
                const message = e instanceof Error ? e.message : String(e);
                this.store.setError(message);
                return of<SaveInspectionResult>({
                    ok: false,
                    errors: [{ fieldId: '', message }],
                });
            }),
        );
    }
}
