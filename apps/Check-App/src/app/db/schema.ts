import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  quantity: integer('quantity').default(0),
  createdAt: text('created_at').notNull(),
});