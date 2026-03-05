import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@nxclaw/ui';
import { apiFetch } from '../lib/auth';
import type { InferenceEndpoint } from '@nxclaw/shared';

export function Settings() {
  const [endpoints, setEndpoints] = useState<InferenceEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKeyRef, setApiKeyRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEndpoints = () => {
    apiFetch('/inference')
      .then((r) => r.json())
      .then(setEndpoints)
      .catch(() => setEndpoints([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEndpoints();
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const l = label.trim();
    const url = baseUrl.trim();
    const ref = apiKeyRef.trim();
    if (!l || !url || !ref) {
      setError('Label, Base URL, and API key ref are required.');
      return;
    }
    try {
      new URL(url);
    } catch {
      setError('Base URL must be a valid URL.');
      return;
    }
    setSubmitting(true);
    apiFetch('/inference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: l, base_url: url, api_key_ref: ref }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d: { error?: string }) => { throw new Error(d.error || 'Failed'); });
        setLabel('');
        setBaseUrl('');
        setApiKeyRef('');
        loadEndpoints();
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--nx-text)' }}>Settings</h2>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: 12, color: 'var(--nx-text-muted)' }}>
          Inference endpoints (Nanoclaw instances)
        </h3>
        <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: 'var(--nx-text-muted)' }}>
          Add inference endpoints to connect to Nanoclaw or other inference backends. Use these when creating agent configs on the Dashboard.
        </p>
        <Card style={{ marginBottom: 16 }}>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 4, color: 'var(--nx-text)' }}>
                Label
              </label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Nanoclaw production"
                disabled={submitting}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 4, color: 'var(--nx-text)' }}>
                Base URL
              </label>
              <Input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://nanoclaw.example.com"
                disabled={submitting}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: 4, color: 'var(--nx-text)' }}>
                API key ref
              </label>
              <Input
                value={apiKeyRef}
                onChange={(e) => setApiKeyRef(e.target.value)}
                placeholder="env var or secret key name"
                disabled={submitting}
              />
            </div>
            {error && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--nx-error)' }}>{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add endpoint'}
            </Button>
          </form>
        </Card>

        {loading ? (
          <p style={{ color: 'var(--nx-text-secondary)' }}>Loading…</p>
        ) : endpoints.length === 0 ? (
          <Card>
            <p style={{ margin: 0, color: 'var(--nx-text-muted)' }}>
              No inference endpoints yet. Add one above to connect to a Nanoclaw instance.
            </p>
          </Card>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {endpoints.map((ep) => (
              <li key={ep.id}>
                <Card>
                  <strong style={{ color: 'var(--nx-text)' }}>{ep.label}</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--nx-text-muted)' }}>{ep.base_url}</p>
                  <p style={{ margin: 4, fontSize: '0.75rem', color: 'var(--nx-text-secondary)' }}>API key ref: {ep.api_key_ref}</p>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
