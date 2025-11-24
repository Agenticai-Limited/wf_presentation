import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

/**
 * Flowcharts table - stores mermaid diagrams
 * Note: User authentication is managed by Clerk
 */
export const flowcharts = sqliteTable('flowcharts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  markdown: text('markdown').notNull().default(''),
  status: text('status', { enum: ['draft', 'published'] })
    .notNull()
    .default('draft'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
})

export type Flowchart = typeof flowcharts.$inferSelect
export type NewFlowchart = typeof flowcharts.$inferInsert
