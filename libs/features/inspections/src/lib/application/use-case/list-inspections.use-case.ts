import { Injectable, inject } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { UseCase } from '@pos-architecture/core';
import { Inspection } from '../../domain/inspection';
import { InspectionsRepository } from '../../domain/ports/inspections.repository';
import { InspectionsStore } from '../store/inspections.store';

@Injectable({ providedIn: 'root' })
export class ListInspectionsUseCase implements UseCase<void, Inspection[]> {

    // * Inyeccion de dependencias.
    private repo = inject(InspectionsRepository);   // puerto (resuelto a DrizzleInspectionsRepository).
    private store = inject(InspectionsStore);

    // * Metodo execute del caso de uso.
    public execute(): Observable<Inspection[]> {
        return this.repo.list().pipe(
            tap((inspections) => this.store.setInspections(inspections)),
            catchError((e: unknown) => {
                this.store.setError(e instanceof Error ? e.message : String(e));
                return throwError(() => e);
            }),
        );
    }
}
