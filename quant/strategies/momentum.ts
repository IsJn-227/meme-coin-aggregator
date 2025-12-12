// quant/strategies/momentum.ts
// Simple momentum strategy: long when close > SMA(window)
export function momentumSignal(closes: number[], window = 20): number {
  if (closes.length < window) return 0; // not enough data
  const slice = closes.slice(-window);
  const sma = slice.reduce((a, b) => a + b, 0) / slice.length;
  const current = closes[closes.length - 1];
  return current > sma ? 1 : 0; // 1 => long, 0 => flat
}
