import { Router } from 'express';
import { getPool } from '../db/pool.js';
import bcrypt from 'bcryptjs';
import { signToken } from '../middleware/auth.js';
import { z } from 'zod';

const loginBody = z.object({ username: z.string().min(1), password: z.string().min(1) });
export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const parsed = loginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'username and password required' });
    return;
  }
  const { username, password } = parsed.data;
  const pool = getPool();
  const r = await pool.query(
    `SELECT u.id, u.tenant_id, u.username, u.password_hash, u.role
     FROM users u JOIN tenants t ON u.tenant_id = t.id
     WHERE u.username = $1 LIMIT 1`,
    [username]
  );
  if (r.rows.length === 0) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const row = r.rows[0];
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = signToken({
    userId: row.id,
    tenantId: row.tenant_id,
    username: row.username,
    role: row.role,
  });
  res.json({ token, username: row.username, role: row.role });
});
