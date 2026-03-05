import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@nxclaw/ui';
import { apiFetch } from '../lib/auth';
import type { AgentConfig, InferenceEndpoint } from '@nxclaw/shared';

export function Dashboard() {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [endpoints, setEndpoints] = useState<InferenceEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [addName, setAddName] = useState('');
  const [addJson, setAddJson] = useState('{}');
  const [addEndpointId, setAddEndpointId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfigs = () => {
    apiFetch('/agent-config')
      .then((r) => r.json())
      .then(setConfigs)
      .catch(() => setConfigs([]))
      .finally(() => setLoading(false));
  };

  const loadEndpoints = () => {
    apiFetch('/inference')
      .then((r) => r.json())
      .then(setEndpoints)
      .catch(() => setEndpoints([]));
  };

  useEffect(() => {
    loadConfigs();
    loadEndpoints();
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = addName.trim();
    if (!name) {
      setError('Name is required.');
      return;
    }
    let config_json: Record<string, unknown> = {};
    if (addJson.trim()) {
      try {
        config_json = JSON.parse(addJson) as Record<string, unknown>;
      } catch {
        setError('Config must be valid JSON.');
        return;
      }
    }
    setSubmitting(true);
    apiFetch('/agent-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        config_json,
        ...(addEndpointId ? { inference_endpoint_id: addEndpointId } : {}),
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d: { error?: string }) => { throw new Error(d.error || 'Failed'); });
        setAddName('');
        setAddJson('{}');
        loadConfigs();
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--nx-text)' }}>Dashboard</h2>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: 12, color: 'var(--nx-text-muted)' }}>Add agent config</h3>
        <Card>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 4, color: 'var(--nx-text)' }}>
                Name
              </label>
              <Input
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Nanoclaw production"
                disabled={submitting}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 4, color: 'var(--nx-text)' }}>
                Inference endpoint (optional)
              </label>
              <select
                value={addEndpointId}
                onChange={(e) => setAddEndpointId(e.target.value)}
                disabled={submitting}
                style={{
                  width: '100%',
                  fontFamily: 'var(--nx-font-sans)',
                  fontSize: '0.9375rem',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid var(--nx-border)',
                  borderRadius: 'var(--nx-radius-sm)',
                  background: 'var(--nx-surface)',
                  color: 'var(--nx-text)',
                }}
              >
                <option value="">None</option>
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>{ep.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 4, color: 'var(--nx-text)' }}>
                Config (JSON, optional)
              </label>
              <textarea
                value={addJson}
                onChange={(e) => setAddJson(e.target.value)}
                placeholder='{"model": "gpt-4", ...}'
                rows={4}
                disabled={submitting}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  fontFamily: 'var(--nx-font-sans)',
                  fontSize: '0.9375rem',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid var(--nx-border)',
                  borderRadius: 'var(--nx-radius-sm)',
                  background: 'var(--nx-surface)',
                  color: 'var(--nx-text)',
                  resize: 'vertical',
                }}
              />
            </div>
            {error && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--nx-error)' }}>{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add config'}
            </Button>
          </form>
        </Card>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: 12, color: 'var(--nx-text-muted)' }}>Agent config</h3>
        {loading ? (
          <p style={{ color: 'var(--nx-text-secondary)' }}>Loading…</p>
        ) : configs.length === 0 ? (
          <Card>
            <p style={{ margin: 0, color: 'var(--nx-text-muted)' }}>No agent configs yet. Add one above or configure via API.</p>
          </Card>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {configs.map((c) => {
              const ep = c.inference_endpoint_id ? endpoints.find((e) => e.id === c.inference_endpoint_id) : null;
              return (
                <li key={c.id}>
                  <Card>
                    <strong style={{ color: 'var(--nx-text)' }}>{c.name}</strong>
                    {ep && (
                      <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--nx-text-muted)' }}>
                        Inference: {ep.label} — {ep.base_url}
                      </p>
                    )}
                    <pre style={{ fontSize: 12, marginTop: 8, overflow: 'auto', color: 'var(--nx-text-muted)' }}>{JSON.stringify(c.config_json, null, 2)}</pre>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
