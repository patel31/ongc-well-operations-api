const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const { ZodError } = require('zod');
const { recordSchema, idSchema, paginationSchema } = require('./validation');
const { openapi } = require('./openapi');

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function validateId(req) {
  return idSchema.parse(req.params.id);
}

function createApp({ repository, healthCheck = async () => true, corsOrigins = [] }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: corsOrigins.length ? corsOrigins : true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-7', legacyHeaders: false }));

  app.get('/', (_req, res) => res.json({
    name: 'ONGC Well Operations API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
  }));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));
  app.get('/openapi.json', (_req, res) => res.json(openapi));

  app.get('/health', asyncRoute(async (_req, res) => {
    try {
      await healthCheck();
      res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
    } catch (_error) {
      res.status(503).json({ status: 'error', database: 'disconnected' });
    }
  }));

  app.get('/api/v1/well-operations', asyncRoute(async (req, res) => {
    const pagination = paginationSchema.parse(req.query);
    const result = await repository.list(pagination);
    res.json({
      data: result.items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
      },
    });
  }));

  app.get('/api/v1/well-operations/:id', asyncRoute(async (req, res) => {
    const record = await repository.findById(validateId(req));
    if (!record) return res.status(404).json({ error: 'Well operation not found' });
    return res.json({ data: record });
  }));

  app.post('/api/v1/well-operations', asyncRoute(async (req, res) => {
    const record = await repository.create(recordSchema.parse(req.body));
    res.status(201).location(`/api/v1/well-operations/${record.id}`).json({ data: record });
  }));

  app.put('/api/v1/well-operations/:id', asyncRoute(async (req, res) => {
    const id = validateId(req);
    const record = await repository.update(id, recordSchema.parse(req.body));
    if (!record) return res.status(404).json({ error: 'Well operation not found' });
    return res.json({ data: record });
  }));

  app.delete('/api/v1/well-operations/:id', asyncRoute(async (req, res) => {
    const removed = await repository.remove(validateId(req));
    if (!removed) return res.status(404).json({ error: 'Well operation not found' });
    return res.status(204).send();
  }));

  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

  app.use((error, _req, res, _next) => {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map((issue) => ({ field: issue.path.join('.') || 'request', message: issue.message })),
      });
    }
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Request body must contain valid JSON' });
    }
    if (error.code === '23505') {
      return res.status(409).json({ error: 'A record with this wellNo already exists' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
