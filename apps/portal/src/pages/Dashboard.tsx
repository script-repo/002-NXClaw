import { useEffect, useState } from 'react';
import { Button, Card, Shell, NavItem } from '@nxclaw/ui';
import { apiFetch, useAuth } from '../lib/auth';
import type { AgentConfig } from '@nxclaw/shared';

export function Dashboard() {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    apiFetch('/agent-config')
      .then((r) => r.json())
      .then(setConfigs)
      .catch(() => setConfigs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Shell
      title="NXClaw Portal"
      headerRight={
        <Button variant="ghost" onClick={() => logout()} style={{ color: 'var(--nx-sidebar-text-muted)' }}>
          Sign out
        </Button>
      }
      sidebar={
        <>
          <NavItem active>Dashboard</NavItem>
          <NavItem>Agents</NavItem>
          <NavItem>Settings</NavItem>
        </>
      }
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--nx-text)' }}>Dashboard</h2>
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: 12, color: 'var(--nx-text-muted)' }}>Agent config</h3>
        {loading ? (
          <p style={{ color: 'var(--nx-text-secondary)' }}>Loading…</p>
        ) : configs.length === 0 ? (
          <Card>
            <p style={{ margin: 0, color: 'var(--nx-text-muted)' }}>No agent configs yet. Configure Nanoclaw instance via API or add UI here.</p>
          </Card>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {configs.map((c) => (
              <li key={c.id}>
                <Card>
                  <strong style={{ color: 'var(--nx-text)' }}>{c.name}</strong>
                  <pre style={{ fontSize: 12, marginTop: 8, overflow: 'auto', color: 'var(--nx-text-muted)' }}>{JSON.stringify(c.config_json, null, 2)}</pre>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}
