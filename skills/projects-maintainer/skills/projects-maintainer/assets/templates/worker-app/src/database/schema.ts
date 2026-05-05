import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * Shared tracking fields. Every user-facing table should spread this in.
 * Convention: never hard-delete — always set isDeleted = true and filter
 * `eq(table.isDeleted, false)` on reads.
 */
export const trackingFields = {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .$onUpdateFn(() => new Date())
    .notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false).notNull(),
}

export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ...trackingFields,
})
