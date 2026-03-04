/**
 * V1 schema: users, tenants, agent_config, inference_endpoints, chat_sessions, messages.
 * pgVector extension required for embeddings (optional in V1).
 */
export const schema = `
-- Single tenant + admin for V1
CREATE TABLE IF NOT EXISTS tenants (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  username  TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'user', -- 'admin' | 'user'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, username)
);

CREATE TABLE IF NOT EXISTS inference_endpoints (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  label  TEXT NOT NULL,
  base_url TEXT NOT NULL,
  api_key_ref TEXT NOT NULL, -- K8s secret key name; actual key never stored
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_config (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  inference_endpoint_id UUID REFERENCES inference_endpoints(id),
  name        TEXT NOT NULL,
  config_json JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  user_id  UUID NOT NULL REFERENCES users(id),
  title    TEXT DEFAULT 'New chat',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL, -- 'user' | 'assistant'
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
`;
