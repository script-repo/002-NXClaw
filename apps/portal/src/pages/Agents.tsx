import { Card } from '@nxclaw/ui';

export function Agents() {
  return (
    <>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--nx-text)' }}>Agents</h2>
      <Card>
        <p style={{ margin: 0, color: 'var(--nx-text-muted)' }}>
          Agent list and management will appear here. Connect to Nanoclaw instances to see running agents.
        </p>
      </Card>
    </>
  );
}
