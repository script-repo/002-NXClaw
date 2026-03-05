import { Outlet, NavLink } from 'react-router-dom';
import { Button, Shell } from '@nxclaw/ui';
import { useAuth } from './lib/auth';

const navItemStyle = (active: boolean): React.CSSProperties => ({
  display: 'block',
  padding: '10px 24px',
  cursor: 'pointer',
  textDecoration: 'none',
  background: active ? 'var(--nx-sidebar-bg-active)' : 'transparent',
  borderLeft: active ? '3px solid var(--nx-sidebar-accent)' : '3px solid transparent',
  color: active ? 'var(--nx-sidebar-text)' : 'var(--nx-sidebar-text-muted)',
  fontSize: '0.9375rem',
  fontWeight: active ? 500 : 400,
});

export function Layout() {
  const { logout } = useAuth();

  return (
    <Shell
      title="NXClaw Portal"
      headerRight={
        <Button variant="ghost" type="button" onClick={() => logout()} style={{ color: 'var(--nx-sidebar-text-muted)', cursor: 'pointer' }}>
          Sign out
        </Button>
      }
      sidebar={
        <>
          <NavLink to="/" style={({ isActive }) => navItemStyle(isActive)} end>Dashboard</NavLink>
          <NavLink to="/agents" style={({ isActive }) => navItemStyle(isActive)}>Agents</NavLink>
          <NavLink to="/settings" style={({ isActive }) => navItemStyle(isActive)}>Settings</NavLink>
        </>
      }
    >
      <Outlet />
    </Shell>
  );
}
