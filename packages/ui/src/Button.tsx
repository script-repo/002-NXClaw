import type { ButtonHTMLAttributes } from 'react';

export function Button({
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const base = 'nx-btn';
  const v = variant === 'primary' ? 'nx-btn-primary' : variant === 'secondary' ? 'nx-btn-secondary' : 'nx-btn-ghost';
  return <button type="button" className={`${base} ${v}`} {...props} />;
}
