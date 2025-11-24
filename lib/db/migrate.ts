import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'

/**
 * Run database migrations
 */
async function runMigrations() {
  console.log('🚀 Running database migrations...')

  const databaseUrl = process.env.DATABASE_URL || 'file:./data/db.sqlite'
  const dbPath = databaseUrl.replace('file:', '')

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
    console.log(`📁 Created data directory: ${dataDir}`)
  }

  const sqlite = new Database(dbPath)
  const db = drizzle(sqlite)

  try {
    migrate(db, { migrationsFolder: './drizzle' })
    console.log('✅ Migrations completed successfully!')
  }
  catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
  finally {
    sqlite.close()
  }
}

runMigrations()
