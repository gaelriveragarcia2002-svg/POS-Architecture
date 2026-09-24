import { Injectable, inject } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import {
    Inspection,
    InspectionsRepository,
    NewInspection,
} from '@pos-architecture/inspections';
import { SQLITE_DB } from '../../../../shared/infrastructure/sqlite/sqlite-db';
import { InspectionMapper } from '../mappers/inspection.mapper';
import { inspections } from '../persistence/inspections.schema';

/* Implementa el puerto InspectionsRepository sobre drizzle-orm/sqlite-proxy,
 * hablando con el unico Worker de SQLite de la app via SQLITE_DB. */
@Injectable()
export class DrizzleInspectionsRepository extends InspectionsRepository {

    // * Inyeccion de dependencias.
    private db = inject(SQLITE_DB);

    // Migracion perezosa: se dispara en la PRIMERA query real, nunca en la
    // construccion de la clase, para no crear el Worker durante SSR.
    private migrated: Promise<void> | null = null;

    // * Metodos de la clase.
    public list(): Observable<Inspection[]> {
        return from(this.ensureReady().then(() => this.db.select().from(inspections))).pipe(
            map((rows) => rows.map(InspectionMapper.toDomain)),
        );
    }

    public save(input: NewInspection): Observable<Inspection> {
        const now = new Date().toISOString();
        const row = {
            id: crypto.randomUUID(),
            subject: input.subject,
            status: 'completed' as const,
            inspectorId: input.inspectorId,
            answers: JSON.stringify(input.answers),
            startedAt: now,
            completedAt: now,
            createdAt: now,
            updatedAt: now,
            syncStatus: 'pending',
        };
        return from(
            this.ensureReady()
                .then(() => this.db.insert(inspections).values(row))
                .then(() => row),
        ).pipe(map(InspectionMapper.toDomain));
    }

    private ensureReady(): Promise<void> {
        this.migrated ??= this.migrate();
        return this.migrated;
    }

    private async migrate(): Promise<void> {
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS inspections (
                id TEXT PRIMARY KEY,
                subject TEXT NOT NULL,
                status TEXT NOT NULL,
                inspector_id TEXT NOT NULL,
                answers TEXT NOT NULL,
                started_at TEXT NOT NULL,
                completed_at TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                sync_status TEXT NOT NULL DEFAULT 'pending'
            )
        `);
    }
}
