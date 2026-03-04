import type { HTMLAttributes } from 'react';

const shellStyles = {
  layout: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    background: 'var(--nx-bg)',
    color: 'var(--nx-text)',
    fontFamily: 'var(--nx-font-sans)',
  },
  header: {
    background: 'var(--nx-sidebar-bg)',
    color: 'var(--nx-sidebar-text)',
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
  },
  headerTitle: {
    position: 'absolute' as const,
    left: '50%',
    transform: 'translateX(-50%)',
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
  },
  headerRight: {
    marginLeft: 'auto',
  },
  body: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },
  sidebar: {
    width: 240,
    background: 'var(--nx-sidebar-bg)',
    color: 'var(--nx-sidebar-text)',
    flexShrink: 0,
    padding: '16px 0',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    padding: 24,
    background: 'var(--nx-bg)',
    color: 'var(--nx-text)',
  },
};

export function Shell({
  title,
  headerRight,
  sidebar,
  children,
  ...props
}: {
  title: string;
  headerRight?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={shellStyles.layout} {...props}>
      <header style={shellStyles.header}>
        <h1 style={shellStyles.headerTitle}>{title}</h1>
        <div style={shellStyles.headerRight}>{headerRight}</div>
      </header>
      <div style={shellStyles.body}>
        {sidebar != null && <aside style={shellStyles.sidebar}>{sidebar}</aside>}
        <main style={shellStyles.main}>{children}</main>
      </div>
    </div>
  );
}

export function NavItem({
  active,
  children,
  ...props
}: { active?: boolean; children: React.ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLDivElement).click()}
      style={{
        padding: '10px 24px',
        cursor: 'pointer',
        background: active ? 'var(--nx-sidebar-bg-active)' : 'transparent',
        borderLeft: active ? '3px solid var(--nx-sidebar-accent)' : '3px solid transparent',
        color: active ? 'var(--nx-sidebar-text)' : 'var(--nx-sidebar-text-muted)',
        fontSize: '0.9375rem',
        fontWeight: active ? 500 : 400,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
