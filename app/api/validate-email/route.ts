import { promises as dns } from 'node:dns';
import { NextResponse } from 'next/server';
import { DISPOSABLE_DOMAINS, EMAIL_PATTERN, suggestEmail } from '@/lib/email-check';

export const runtime = 'nodejs';

// Confirms an address is well formed and that its domain can receive mail (MX, or A/AAAA as the
// mail fallback). It can't prove the mailbox exists — that needs a verification email.
async function domainAcceptsMail(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveMx(domain);
    if (records.some((record) => record.exchange && record.exchange !== '.')) return true;
  } catch {
    // No MX records; fall through to the address-record fallback.
  }
  const lookups = await Promise.allSettled([dns.resolve4(domain), dns.resolve6(domain)]);
  return lookups.some((result) => result.status === 'fulfilled' && result.value.length > 0);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ valid: false, reason: 'Enter a complete email address, like name@example.com.' });
  }

  const domain = email.split('@')[1];
  const suggestion = suggestEmail(email);

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json({ valid: false, reason: 'Temporary or disposable email addresses can’t be used. Please use an email you check regularly.' });
  }

  const reachable = await Promise.race([
    domainAcceptsMail(domain),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
  ]);

  // A lookup timeout shouldn't block sign-up; only a definite "no mail server" does.
  if (reachable === false) {
    return NextResponse.json({ valid: false, reason: `“${domain}” doesn’t accept email. Check the address for typos.`, suggestion });
  }

  return NextResponse.json({ valid: true, suggestion });
}
