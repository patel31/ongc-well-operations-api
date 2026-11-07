const recordProperties = {
  id: { type: 'string', format: 'uuid', example: '19d501f4-dccf-4f4a-9808-dd7d44eaa477' },
  wellNo: { type: 'string', maxLength: 50, example: 'ONGC-WELL-101' },
  job: { type: 'string', maxLength: 200, example: 'Drilling' },
  purpose: { type: 'string', maxLength: 2000, example: 'Exploratory drilling operation' },
  dateTime: { type: 'string', format: 'date-time', example: '2026-11-07T10:30:00+05:30' },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

const inputSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['wellNo', 'job', 'purpose', 'dateTime'],
  properties: Object.fromEntries(Object.entries(recordProperties).filter(([key]) =>
    ['wellNo', 'job', 'purpose', 'dateTime'].includes(key)
  )),
};

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'ONGC Well Operations API',
    version: '1.0.0',
    description: 'REST API for managing well operation records for the ONGC college project.',
  },
  servers: [{ url: '/', description: 'Current server' }],
  tags: [{ name: 'Well Operations' }, { name: 'System' }],
  paths: {
    '/health': {
      get: { tags: ['System'], summary: 'Health check', responses: { 200: { description: 'API is healthy' }, 503: { description: 'Database unavailable' } } },
    },
    '/api/v1/well-operations': {
      get: {
        tags: ['Well Operations'], summary: 'List records',
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', minimum: 1, default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: { 200: { description: 'Paginated records' }, 400: { $ref: '#/components/responses/BadRequest' } },
      },
      post: {
        tags: ['Well Operations'], summary: 'Create a record',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WellOperationInput' } } } },
        responses: { 201: { description: 'Created' }, 400: { $ref: '#/components/responses/BadRequest' }, 409: { description: 'Well number already exists' } },
      },
    },
    '/api/v1/well-operations/{id}': {
      parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
      get: { tags: ['Well Operations'], summary: 'Get one record', responses: { 200: { description: 'Record' }, 404: { $ref: '#/components/responses/NotFound' } } },
      put: {
        tags: ['Well Operations'], summary: 'Replace a record',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WellOperationInput' } } } },
        responses: { 200: { description: 'Updated' }, 400: { $ref: '#/components/responses/BadRequest' }, 404: { $ref: '#/components/responses/NotFound' }, 409: { description: 'Well number already exists' } },
      },
      delete: { tags: ['Well Operations'], summary: 'Delete a record', responses: { 204: { description: 'Deleted' }, 404: { $ref: '#/components/responses/NotFound' } } },
    },
  },
  components: {
    schemas: {
      WellOperationInput: inputSchema,
      WellOperation: { allOf: [inputSchema, { type: 'object', properties: recordProperties }] },
    },
    responses: {
      BadRequest: { description: 'Invalid request' },
      NotFound: { description: 'Record not found' },
    },
  },
};

module.exports = { openapi };
