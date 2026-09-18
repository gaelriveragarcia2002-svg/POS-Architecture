import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const inspections = sqliteTable('inspections', {
  id: text('id').primaryKey(),
  subject: text('subject').notNull(),
  status: text('status').notNull(), // 'draft' | 'completed'
  inspectorId: text('inspector_id').notNull(),
  answers: text('answers').notNull(), // JSON.stringify(InspectionAnswers)
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  // Bookkeeping de sync: deliberadamente NO existe en el dominio (ver
  // InspectionMapper) — es un detalle de persistencia, no una decision de
  // negocio. 'pending' hasta que exista un push real contra un backend.
  syncStatus: text('sync_status').notNull().default('pending'),
});
