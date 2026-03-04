import { Router } from 'express';
import { getPool } from '../db/pool.js';
import { z } from 'zod';
import type { JwtPayload } from '../middleware/auth.js';

const createSessionBody = z.object({ title: z.string().optional() });
const sendMessageBody = z.object({ content: z.string().min(1).max(64 * 1024) });

export const chatRouter = Router();

chatRouter.get('/sessions', async (req, res) => {
  const user = (req as unknown as { user: JwtPayload }).user;
  const pool = getPool();
  const r = await pool.query(
    `SELECT id, title, created_at FROM chat_sessions WHERE user_id = $1 ORDER BY created_at DESC`,
    [user.userId]
  );
  res.json(r.rows);
});

chatRouter.post('/sessions', async (req, res) => {
  const user = (req as unknown as { user: JwtPayload }).user;
  const parsed = createSessionBody.safeParse(req.body);
  const title = parsed.success && parsed.data.title ? parsed.data.title : 'New chat';
  const pool = getPool();
  const r = await pool.query(
    `INSERT INTO chat_sessions (tenant_id, user_id, title) VALUES ($1, $2, $3)
     RETURNING id, title, created_at`,
    [user.tenantId, user.userId, title]
  );
  res.status(201).json(r.rows[0]);
});

chatRouter.get('/sessions/:sessionId/messages', async (req, res) => {
  const user = (req as unknown as { user: JwtPayload }).user;
  const pool = getPool();
  const r = await pool.query(
    `SELECT m.id, m.role, m.content, m.created_at FROM messages m
     JOIN chat_sessions s ON m.session_id = s.id
     WHERE s.id = $1 AND s.user_id = $2 ORDER BY m.created_at ASC`,
    [req.params.sessionId, user.userId]
  );
  res.json(r.rows);
});

/**
 * Send message: persist user message, proxy to Nanoclaw (NANOCLAW_URL env), persist assistant reply.
 * V1: request/response only.
 */
chatRouter.post('/sessions/:sessionId/messages', async (req, res) => {
  const user = (req as unknown as { user: JwtPayload }).user;
  const parsed = sendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'content required (1-64k chars)' });
    return;
  }
  const pool = getPool();
  const sessionCheck = await pool.query(
    `SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2`,
    [req.params.sessionId, user.userId]
  );
  if (sessionCheck.rows.length === 0) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  await pool.query(
    `INSERT INTO messages (session_id, role, content) VALUES ($1, 'user', $2)`,
    [req.params.sessionId, parsed.data.content]
  );
  const nanoclawUrl = process.env.NANOCLAW_URL;
  let assistantContent: string;
  if (nanoclawUrl) {
    try {
      const proxyRes = await fetch(`${nanoclawUrl.replace(/\/$/, '')}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: parsed.data.content, tenantId: user.tenantId }),
      });
      if (!proxyRes.ok) {
        const t = await proxyRes.text();
        assistantContent = `[Agent error: ${proxyRes.status} ${t.slice(0, 200)}]`;
      } else {
        const data = (await proxyRes.json()) as { reply?: string };
        assistantContent = data.reply ?? '[No reply]';
      }
    } catch (e) {
      assistantContent = `[Agent unreachable: ${e instanceof Error ? e.message : String(e)}]`;
    }
  } else {
    assistantContent = '[NANOCLAW_URL not configured; add agent endpoint to enable replies.]';
  }
  const msgRes = await pool.query(
    `INSERT INTO messages (session_id, role, content) VALUES ($1, 'assistant', $2)
     RETURNING id, role, content, created_at`,
    [req.params.sessionId, assistantContent]
  );
  res.status(201).json(msgRes.rows[0]);
});
