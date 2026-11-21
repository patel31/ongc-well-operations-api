const inputProperties = {
  wellNo: { type: 'string', minLength: 1, maxLength: 50, description: 'Unique well number. Uniqueness is case-sensitive.', example: 'ONGC-WELL-101' },
  job: { type: 'string', minLength: 1, maxLength: 200, description: 'Job or operation name.', example: 'Drilling' },
  purpose: { type: 'string', minLength: 1, maxLength: 2000, description: 'Business purpose or reason for the operation.', example: 'Exploratory drilling operation' },
  dateTime: { type: 'string', format: 'date-time', description: 'Operation date and time in ISO 8601 format, including a timezone.', example: '2026-11-21T10:30:00+05:30' },
};

const recordProperties = {
  id: { type: 'string', format: 'uuid', readOnly: true, description: 'System-generated record identifier.', example: '19d501f4-dccf-4f4a-9808-dd7d44eaa477' },
  ...inputProperties,
  createdAt: { type: 'string', format: 'date-time', readOnly: true, description: 'UTC timestamp when the record was created.', example: '2026-11-21T05:00:00.000Z' },
  updatedAt: { type: 'string', format: 'date-time', readOnly: true, description: 'UTC timestamp when the record was last updated.', example: '2026-11-21T05:00:00.000Z' },
};

const errorContent = (example) => ({
  'application/json': { schema: { $ref: '#/components/schemas/Error' }, example },
});

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'ONGC Well Operations API',
    version: '1.0.0',
    description: [
      'REST API for managing well-operation records for an ONGC college internship project.',
      '',
      '**Important:** This demonstration deployment currently has no authentication. Do not submit confidential or production ONGC data.',
      '',
      'Rate limit: 200 requests per 15 minutes per client address. Request bodies are limited to 100 KB.',
    ].join('\n'),
    contact: { name: 'ONGC Well Operations API project' },
  },
  servers: [
    { url: 'https://ongc-well-operations-api.onrender.com', description: 'Live internship demonstration' },
    { url: 'http://localhost:3000', description: 'Optional local environment' },
  ],
  security: [],
  tags: [
    { name: 'System', description: 'Service information and health monitoring.' },
    { name: 'Well Operations', description: 'Create, read, update, and delete well-operation records.' },
  ],
  paths: {
    '/': {
      get: {
        tags: ['System'], summary: 'Get API information', operationId: 'getApiInformation',
        responses: {
          200: {
            description: 'Basic API information and navigation links.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiInformation' }, example: { name: 'ONGC Well Operations API', version: '1.0.0', documentation: '/api-docs', health: '/health' } } },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['System'], summary: 'Check API and database health', operationId: 'getHealth',
        responses: {
          200: {
            description: 'API is healthy and the database is reachable.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Health' }, example: { status: 'ok', database: 'connected', timestamp: '2026-11-21T15:03:30.000Z' } } },
          },
          503: { description: 'Database is unavailable.', content: { 'application/json': { example: { status: 'error', database: 'disconnected' } } } },
        },
      },
    },
    '/api/v1/well-operations': {
      get: {
        tags: ['Well Operations'], summary: 'List well-operation records', operationId: 'listWellOperations',
        description: 'Returns records ordered by operation date/time descending, with newest records first.',
        parameters: [
          { in: 'query', name: 'page', description: 'Page number.', schema: { type: 'integer', minimum: 1, default: 1 } },
          { in: 'query', name: 'limit', description: 'Records per page.', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
        ],
        responses: {
          200: { description: 'Paginated records.', content: { 'application/json': { schema: { $ref: '#/components/schemas/WellOperationListResponse' } } } },
          400: { $ref: '#/components/responses/BadRequest' },
          429: { $ref: '#/components/responses/TooManyRequests' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      post: {
        tags: ['Well Operations'], summary: 'Create a well-operation record', operationId: 'createWellOperation',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WellOperationInput' } } } },
        responses: {
          201: {
            description: 'Record created. The Location header identifies the new resource.',
            headers: { Location: { description: 'Relative URL of the created record.', schema: { type: 'string' } } },
            content: { 'application/json': { schema: { $ref: '#/components/schemas/WellOperationResponse' } } },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { $ref: '#/components/responses/Conflict' },
          429: { $ref: '#/components/responses/TooManyRequests' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
    '/api/v1/well-operations/{id}': {
      parameters: [{ in: 'path', name: 'id', required: true, description: 'Record UUID.', schema: { type: 'string', format: 'uuid' }, example: '19d501f4-dccf-4f4a-9808-dd7d44eaa477' }],
      get: {
        tags: ['Well Operations'], summary: 'Get one well-operation record', operationId: 'getWellOperation',
        responses: {
          200: { description: 'Requested record.', content: { 'application/json': { schema: { $ref: '#/components/schemas/WellOperationResponse' } } } },
          400: { $ref: '#/components/responses/BadRequest' }, 404: { $ref: '#/components/responses/NotFound' },
          429: { $ref: '#/components/responses/TooManyRequests' }, 500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      put: {
        tags: ['Well Operations'], summary: 'Replace a well-operation record', operationId: 'updateWellOperation',
        description: 'Full replacement: all four input fields are required. Partial PATCH updates are not supported.',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WellOperationInput' } } } },
        responses: {
          200: { description: 'Updated record.', content: { 'application/json': { schema: { $ref: '#/components/schemas/WellOperationResponse' } } } },
          400: { $ref: '#/components/responses/BadRequest' }, 404: { $ref: '#/components/responses/NotFound' },
          409: { $ref: '#/components/responses/Conflict' }, 429: { $ref: '#/components/responses/TooManyRequests' },
          500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
      delete: {
        tags: ['Well Operations'], summary: 'Delete a well-operation record', operationId: 'deleteWellOperation',
        responses: {
          204: { description: 'Record deleted successfully. The response has no body.' },
          400: { $ref: '#/components/responses/BadRequest' }, 404: { $ref: '#/components/responses/NotFound' },
          429: { $ref: '#/components/responses/TooManyRequests' }, 500: { $ref: '#/components/responses/InternalServerError' },
        },
      },
    },
  },
  components: {
    schemas: {
      ApiInformation: {
        type: 'object', required: ['name', 'version', 'documentation', 'health'],
        properties: { name: { type: 'string' }, version: { type: 'string' }, documentation: { type: 'string' }, health: { type: 'string' } },
      },
      Health: {
        type: 'object', required: ['status', 'database', 'timestamp'],
        properties: { status: { type: 'string', enum: ['ok'] }, database: { type: 'string', enum: ['connected'] }, timestamp: { type: 'string', format: 'date-time' } },
      },
      WellOperationInput: { type: 'object', additionalProperties: false, required: ['wellNo', 'job', 'purpose', 'dateTime'], properties: inputProperties },
      WellOperation: { type: 'object', additionalProperties: false, required: ['id', 'wellNo', 'job', 'purpose', 'dateTime', 'createdAt', 'updatedAt'], properties: recordProperties },
      WellOperationResponse: { type: 'object', required: ['data'], properties: { data: { $ref: '#/components/schemas/WellOperation' } } },
      Pagination: {
        type: 'object', required: ['page', 'limit', 'total', 'totalPages'],
        properties: {
          page: { type: 'integer', minimum: 1, example: 1 }, limit: { type: 'integer', minimum: 1, maximum: 100, example: 20 },
          total: { type: 'integer', minimum: 0, example: 1 }, totalPages: { type: 'integer', minimum: 0, example: 1 },
        },
      },
      WellOperationListResponse: {
        type: 'object', required: ['data', 'pagination'],
        properties: { data: { type: 'array', items: { $ref: '#/components/schemas/WellOperation' } }, pagination: { $ref: '#/components/schemas/Pagination' } },
      },
      Error: { type: 'object', required: ['error'], properties: { error: { type: 'string', example: 'Well operation not found' } } },
      ValidationError: {
        type: 'object', required: ['error', 'details'],
        properties: {
          error: { type: 'string', example: 'Validation failed' },
          details: { type: 'array', items: { type: 'object', required: ['field', 'message'], properties: { field: { type: 'string', example: 'dateTime' }, message: { type: 'string', example: 'dateTime must be ISO 8601 with a timezone' } } } },
        },
      },
    },
    responses: {
      BadRequest: { description: 'Invalid UUID, query parameter, JSON, or request body.', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
      NotFound: { description: 'Record not found.', content: errorContent({ error: 'Well operation not found' }) },
      Conflict: { description: 'The supplied wellNo is already in use.', content: errorContent({ error: 'A record with this wellNo already exists' }) },
      TooManyRequests: { description: 'More than 200 requests were received from the client within 15 minutes.' },
      InternalServerError: { description: 'Unexpected server or database error.', content: errorContent({ error: 'Internal server error' }) },
    },
  },
};

module.exports = { openapi };
