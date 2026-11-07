const { config } = require('./config');
const { pool, initializeDatabase } = require('./db');
const { createRepository } = require('./repository');
const { createApp } = require('./app');

async function start() {
  await initializeDatabase();
  const repository = createRepository(pool);
  const app = createApp({
    repository,
    corsOrigins: config.corsOrigins,
    healthCheck: () => pool.query('SELECT 1'),
  });

  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`ONGC API listening on port ${config.port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received; shutting down`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
