const { z } = require('zod');

const recordSchema = z.object({
  wellNo: z.string().trim().min(1, 'Well number is required').max(50),
  job: z.string().trim().min(1, 'Job is required').max(200),
  purpose: z.string().trim().min(1, 'Purpose is required').max(2000),
  dateTime: z.string().datetime({ offset: true, message: 'dateTime must be ISO 8601 with a timezone' }),
}).strict();

const idSchema = z.string().uuid('id must be a valid UUID');

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = { recordSchema, idSchema, paginationSchema };
