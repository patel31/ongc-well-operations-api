const { randomUUID } = require('node:crypto');

const columns = `
  id,
  well_no AS "wellNo",
  job,
  purpose,
  operation_at AS "dateTime",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

function createRepository(pool) {
  return {
    async list({ page, limit }) {
      const offset = (page - 1) * limit;
      const [itemsResult, countResult] = await Promise.all([
        pool.query(
          `SELECT ${columns} FROM well_operations ORDER BY operation_at DESC, created_at DESC LIMIT $1 OFFSET $2`,
          [limit, offset]
        ),
        pool.query('SELECT COUNT(*)::int AS total FROM well_operations'),
      ]);
      return { items: itemsResult.rows, total: countResult.rows[0].total };
    },

    async findById(id) {
      const result = await pool.query(`SELECT ${columns} FROM well_operations WHERE id = $1`, [id]);
      return result.rows[0] || null;
    },

    async create(data) {
      const result = await pool.query(
        `INSERT INTO well_operations (id, well_no, job, purpose, operation_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${columns}`,
        [randomUUID(), data.wellNo, data.job, data.purpose, data.dateTime]
      );
      return result.rows[0];
    },

    async update(id, data) {
      const result = await pool.query(
        `UPDATE well_operations
         SET well_no = $2, job = $3, purpose = $4, operation_at = $5, updated_at = NOW()
         WHERE id = $1
         RETURNING ${columns}`,
        [id, data.wellNo, data.job, data.purpose, data.dateTime]
      );
      return result.rows[0] || null;
    },

    async remove(id) {
      const result = await pool.query('DELETE FROM well_operations WHERE id = $1 RETURNING id', [id]);
      return result.rowCount > 0;
    },
  };
}

module.exports = { createRepository };
