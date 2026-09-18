import { Item } from '@pos-architecture/items';
import { items } from '../persistence/items.schema';

type ItemRow = typeof items.$inferSelect;

/* Desenvuelve la fila de drizzle a la entidad de dominio. Hoy son
 * estructuralmente iguales, pero el mapper explicito evita que un cambio de
 * columna (ej. renombrar created_at) se filtre directo al dominio. */
export class ItemMapper {
  public static toDomain(row: ItemRow): Item {
    return {
      id: row.id,
      name: row.name,
      quantity: row.quantity ?? 0,
      createdAt: row.createdAt,
    };
  }
}
