/** Fixed-rate amortization estimate; annualRate is a percentage. */
export function calculateEmi(principal: number, annualRate: number, months: number): number | null {
  if (![principal, annualRate, months].every(Number.isFinite) || principal < 0 || annualRate < 0 || !Number.isInteger(months) || months < 1) return null;
  if (annualRate === 0) return principal / months;
  const monthlyRate = annualRate / 1200;
  const payment = principal * monthlyRate / -Math.expm1(-months * Math.log1p(monthlyRate));
  return Number.isFinite(payment) ? payment : null;
}
