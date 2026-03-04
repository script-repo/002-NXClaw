export interface User {
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  inference_endpoint_id: string | null;
  config_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface InferenceEndpoint {
  id: string;
  label: string;
  base_url: string;
  api_key_ref: string;
  created_at: string;
}
