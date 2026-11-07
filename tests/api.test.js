const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../src/app');

const id = '19d501f4-dccf-4f4a-9808-dd7d44eaa477';
const input = {
  wellNo: 'ONGC-WELL-101',
  job: 'Drilling',
  purpose: 'Exploratory drilling operation',
  dateTime: '2026-11-07T10:30:00+05:30',
};
const stored = { ...input, id, createdAt: '2026-11-07T05:00:00.000Z', updatedAt: '2026-11-07T05:00:00.000Z' };

function buildApp(overrides = {}) {
  const repository = {
    list: async () => ({ items: [stored], total: 1 }),
    findById: async () => stored,
    create: async (data) => ({ ...stored, ...data }),
    update: async (_id, data) => ({ ...stored, ...data }),
    remove: async () => true,
    ...overrides,
  };
  return createApp({ repository });
}

test('GET list returns pagination', async () => {
  const response = await request(buildApp()).get('/api/v1/well-operations?page=1&limit=10');
  assert.equal(response.status, 200);
  assert.equal(response.body.data.length, 1);
  assert.equal(response.body.pagination.total, 1);
});

test('POST creates a valid record', async () => {
  const response = await request(buildApp()).post('/api/v1/well-operations').send(input);
  assert.equal(response.status, 201);
  assert.equal(response.body.data.wellNo, input.wellNo);
  assert.match(response.headers.location, new RegExp(id));
});

test('POST rejects missing and invalid fields', async () => {
  const response = await request(buildApp()).post('/api/v1/well-operations').send({ wellNo: '' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Validation failed');
  assert.ok(response.body.details.length >= 1);
});

test('GET returns 404 when the record is absent', async () => {
  const response = await request(buildApp({ findById: async () => null })).get(`/api/v1/well-operations/${id}`);
  assert.equal(response.status, 404);
});

test('DELETE returns 204', async () => {
  const response = await request(buildApp()).delete(`/api/v1/well-operations/${id}`);
  assert.equal(response.status, 204);
});

test('invalid UUID returns 400', async () => {
  const response = await request(buildApp()).get('/api/v1/well-operations/not-a-uuid');
  assert.equal(response.status, 400);
});
