import { Card } from '@nxclaw/ui';

export function Settings() {
  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--nx-text)' }}>Settings</h2>
      <Card>
        <p style={{ margin: 0, color: 'var(--nx-text-muted)' }}>
          Portal and API settings. Configure default inference endpoint, tenant, and preferences.
        </p>
      </Card>
    </>
  );
}
