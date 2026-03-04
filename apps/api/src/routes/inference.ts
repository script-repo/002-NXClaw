import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { z } from 'zod';
import type { JwtPayload } from '../middleware/auth.js';

const createBody = z.object({
  label: z.string().min(1),
  base_url: z.string().url(),
  api_key_ref: z.string().min(1),
});

export const inferenceRouter = Router();

inferenceRouter.get('/', async (req, res) => {
  const user = (req as unknown as { user: JwtPayload }).user;
  const pool = getPool();
  const r = await pool.query(
    `SELECT id, label, base_url, api_key_ref, created_at
     FROM inference_endpoints WHERE tenant_id = $1 ORDER BY created_at`,
    [user.tenantId]
  );
  res.json(r.rows);
});

inferenceRouter.post('/', async (req, res) => {
  const user = (req as unknown as { user: JwtPayload }).user;
  const parsed = createBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const pool = getPool();
  const r = await pool.query(
    `INSERT INTO inference_endpoints (tenant_id, label, base_url, api_key_ref)
     VALUES ($1, $2, $3, $4)
     RETURNING id, label, base_url, api_key_ref, created_at`,
    [user.tenantId, parsed.data.label, parsed.data.base_url, parsed.data.api_key_ref]
  );
  res.status(201).json(r.rows[0]);
});
