/**
 * NXClaw API — Backend for portal and chat.
 * Auth (simple user in DB), agent config, chat persistence, proxy to Nanoclaw.
 */
import express from 'express';
import { authRouter } from './routes/auth.js';
import { agentConfigRouter } from './routes/agent-config.js';
import { chatRouter } from './routes/chat.js';
import { inferenceRouter } from './routes/inference.js';
import { authMiddleware } from './middleware/auth.js';
import { getPool } from './db/pool.js';
import { schema } from './db/schema.js';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/agent-config', authMiddleware, agentConfigRouter);
app.use('/api/inference', authMiddleware, inferenceRouter);
app.use('/api/chat', authMiddleware, chatRouter);

const pool = getPool();
const port = Number(process.env.PORT) || 3000;

async function ensureDb() {
  await pool.query(schema);
  const tenantCheck = await pool.query('SELECT id FROM tenants LIMIT 1');
  if (tenantCheck.rows.length > 0) return;
  const tenantRes = await pool.query(`INSERT INTO tenants (name) VALUES ('default') RETURNING id`);
  const tenantId = tenantRes.rows[0].id;
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin', 10);
  await pool.query(
    `INSERT INTO users (tenant_id, username, password_hash, role) VALUES ($1, $2, $3, 'admin')`,
    [tenantId, process.env.ADMIN_USERNAME || 'admin', hash]
  );
  console.log('Seeded default tenant and admin user.');
}

async function start() {
  try {
    await pool.query('SELECT 1');
  } catch (e) {
    console.error('DB not ready:', e);
    process.exit(1);
  }
  await ensureDb();
  app.listen(port, () => console.log(`NXClaw API listening on ${port}`));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
