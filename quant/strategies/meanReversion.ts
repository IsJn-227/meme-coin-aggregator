// quant/strategies/meanReversion.ts
// Simple Bollinger-like mean reversion: buy when price < mean - k*std, sell when > mean + k*std
export function meanReversionSignal(closes: number[], window = 20, k = 2): number {
  if (closes.length < window) return 0;
  const slice = closes.slice(-window);
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / slice.length;
  const std = Math.sqrt(variance);
  const current = closes[closes.length - 1];

  if (current < mean - k * std) return 1;  // long (expect reversion up)
  if (current > mean + k * std) return -1; // short / exit signal (we'll treat -1 as exit)
  return 0; // hold / no action
}
