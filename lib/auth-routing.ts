import type { UserRole } from '@/types';

export type NormalizedUserRole = 'user' | 'agent' | 'admin';

export function normalizeUserRole(role: UserRole | string | null | undefined): NormalizedUserRole | null {
  const normalized = role?.toLowerCase();

  if (normalized === 'user' || normalized === 'agent' || normalized === 'admin') {
    return normalized;
  }

  return null;
}

export function isStaffRole(role: UserRole | string | null | undefined): boolean {
  const normalized = normalizeUserRole(role);
  return normalized === 'agent' || normalized === 'admin';
}

export function getRoleHomePath(role: UserRole | string | null | undefined): string {
  const normalized = normalizeUserRole(role);

  if (normalized === 'admin') return '/admin';
  if (normalized === 'agent') return '/agent';

  return '/';
}
