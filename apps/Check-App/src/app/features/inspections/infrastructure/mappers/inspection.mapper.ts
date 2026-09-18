import { Inspection, InspectionAnswers } from '@pos-architecture/inspections';
import { inspections } from '../persistence/inspections.schema';

type InspectionRow = typeof inspections.$inferSelect;

/* Desenvuelve la fila de drizzle a la entidad de dominio. `syncStatus`
 * deliberadamente no se mapea: el dominio no sabe que existe. */
export class InspectionMapper {
  public static toDomain(row: InspectionRow): Inspection {
    return {
      id: row.id,
      subject: row.subject,
      status: row.status as Inspection['status'],
      inspectorId: row.inspectorId,
      answers: JSON.parse(row.answers) as InspectionAnswers,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
