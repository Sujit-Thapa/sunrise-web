// Client-safe email helpers shared by the sign-up form and /api/validate-email.

export const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

const COMMON_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com', 'proton.me', 'protonmail.com', 'ymail.com', 'aol.com'];

// Domains for throwaway inboxes; sign-ups from them can't be followed up.
export const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', '10minutemail.com', 'tempmail.com', 'temp-mail.org', 'yopmail.com',
  'trashmail.com', 'getnada.com', 'dispostable.com', 'sharklasers.com', 'maildrop.cc', 'throwawaymail.com', 'fakeinbox.com', 'mintemail.com',
]);

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length];
}

// "jane@gmial.com" → "jane@gmail.com"; null when the domain looks intentional.
export function suggestEmail(email: string): string | null {
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (!local || !domain || COMMON_DOMAINS.includes(domain)) return null;
  const match = COMMON_DOMAINS.map((candidate) => ({ candidate, score: distance(domain, candidate) })).sort((a, b) => a.score - b.score)[0];
  return match && match.score > 0 && match.score <= 2 ? `${local}@${match.candidate}` : null;
}
