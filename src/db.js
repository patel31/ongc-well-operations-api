const { Pool } = require('pg');
const { config } = require('./config');

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required. Copy .env.example to .env and set it.');
}

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : undefined,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS well_operations (
      id UUID PRIMARY KEY,
      well_no VARCHAR(50) NOT NULL UNIQUE,
      job VARCHAR(200) NOT NULL,
      purpose TEXT NOT NULL,
      operation_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_well_operations_operation_at ON well_operations (operation_at DESC)'
  );
}

module.exports = { pool, initializeDatabase };
