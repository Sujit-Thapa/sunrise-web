import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// "Sita Sharma" → "SS"; `fallback` is shown when there's no usable name.
export function initials(name?: string | null, fallback = ''): string {
  return (name ?? '').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || fallback;
}

export const ROLE_LABELS: Record<string, string> = { ADMIN: 'Administrator', AGENT: 'Agent', USER: 'Customer' };
