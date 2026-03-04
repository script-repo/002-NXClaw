import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { z } from 'zod';
import type { JwtPayload } from '../middleware/auth.js';

const createBody = z.object({
  name: z.string().min(1),
  inference_endpoint_id: z.string().uuid().optional(),
  config_json: z.record(z.unknown()).default({}),
});
const updateBody = z.object({
  name: z.string().min(1).optional(),
  inference_endpoint_id: z.string().uuid().optional(),
  config_json: z.record(z.unknown()).optional(),
});

export const agentConfigRouter = Router();

agentConfigRouter.get('/', async (req, res) => {
  const user = (req as unknown as { user: JwtPayload }).user;
  const pool = getPool();
  const r = await pool.query(
    `SELECT id, name, inference_endpoint_id, config_json, created_at, updated_at
     FROM agent_config WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [user.tenantId]
  );
  res.json(r.rows);
});

agentConfigRouter.post('/', async (req, res) => {
  const user = (req as unknown as { user: JwtPayload }).user;
  const parsed = createBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const pool = getPool();
  const r = await pool.query(
    `INSERT INTO agent_config (tenant_id, name, inference_endpoint_id, config_json)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, inference_endpoint_id, config_json, created_at, updated_at`,
    [user.tenantId, parsed.data.name, parsed.data.inference_endpoint_id ?? null, JSON.stringify(parsed.data.config_json)]
  );
  res.status(201).json(r.rows[0]);
});

agentConfigRouter.get('/:id', async (req, res) => {
  const user = (req as unknown as { user: JwtPayload }).user;
  const pool = getPool();
  const r = await pool.query(
    `SELECT id, name, inference_endpoint_id, config_json, created_at, updated_at
     FROM agent_config WHERE id = $1 AND tenant_id = $2`,
    [req.params.id, user.tenantId]
  );
  if (r.rows.length === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(r.rows[0]);
});

agentConfigRouter.patch('/:id', async (req, res) => {
  const user = (req as unknown as { user: JwtPayload }).user;
  const parsed = updateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const pool = getPool();
  const updates: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (parsed.data.name !== undefined) {
    updates.push(`name = $${i++}`);
    values.push(parsed.data.name);
  }
  if (parsed.data.inference_endpoint_id !== undefined) {
    updates.push(`inference_endpoint_id = $${i++}`);
    values.push(parsed.data.inference_endpoint_id);
  }
  if (parsed.data.config_json !== undefined) {
    updates.push(`config_json = $${i++}`);
    values.push(JSON.stringify(parsed.data.config_json));
  }
  updates.push(`updated_at = now()`);
  values.push(req.params.id, user.tenantId);
  const r = await pool.query(
    `UPDATE agent_config SET ${updates.join(', ')} WHERE id = $${i} AND tenant_id = $${i + 1}
     RETURNING id, name, inference_endpoint_id, config_json, created_at, updated_at`,
    values
  );
  if (r.rows.length === 0) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(r.rows[0]);
});
