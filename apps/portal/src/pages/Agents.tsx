import { useEffect, useState } from 'react';
import { Card } from '@nxclaw/ui';
import { apiFetch } from '../lib/auth';
import { NavLink } from 'react-router-dom';
import type { InferenceEndpoint } from '@nxclaw/shared';

export function Agents() {
  const [endpoints, setEndpoints] = useState<InferenceEndpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/inference')
      .then((r) => r.json())
      .then(setEndpoints)
      .catch(() => setEndpoints([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--nx-text)' }}>Agents</h2>
      <p style={{ margin: '0 0 16px', fontSize: '0.875rem', color: 'var(--nx-text-muted)' }}>
        Nanoclaw instances (inference endpoints) you configure in Settings appear below. Add agent configs on the Dashboard to use them.
      </p>
      {loading ? (
        <p style={{ color: 'var(--nx-text-secondary)' }}>Loading…</p>
      ) : endpoints.length === 0 ? (
        <Card>
          <p style={{ margin: 0, color: 'var(--nx-text-muted)' }}>
            No Nanoclaw instances yet. Add an inference endpoint in{' '}
            <NavLink to="/settings" style={{ color: 'var(--nx-link)' }}>Settings</NavLink> to connect to a Nanoclaw instance.
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
    </>
  );
}
