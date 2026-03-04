/**
 * Run schema and optional seed (one tenant + one admin user).
 * Usage: DATABASE_URL=... node scripts/init-db.js
 */
import { getPool } from '../src/db/pool.js';
import { schema } from '../src/db/schema.js';
import bcrypt from 'bcryptjs';

const pool = getPool();

async function main() {
  await pool.query(schema);
  const tenantCheck = await pool.query('SELECT id FROM tenants LIMIT 1');
  if (tenantCheck.rows.length > 0) {
    console.log('Tenant exists; skipping seed.');
    process.exit(0);
  }
  const tenantRes = await pool.query(
    `INSERT INTO tenants (name) VALUES ('default') RETURNING id`
  );
  const tenantId = tenantRes.rows[0].id;
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin', 10);
  await pool.query(
    `INSERT INTO users (tenant_id, username, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
    [tenantId, process.env.ADMIN_USERNAME || 'admin', hash]
  );
  console.log('Seeded tenant "default" and admin user (admin / admin unless ADMIN_USERNAME/ADMIN_PASSWORD set).');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
