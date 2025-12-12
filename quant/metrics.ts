// quant/metrics.ts
// Small helpers to compute returns, cumulative return, max drawdown, and a simple Sharpe-like ratio.

export function pctReturns(values: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    returns.push((values[i] - values[i - 1]) / (values[i - 1] + 1e-12));
  }
  return returns;
}

export function cumulativeReturn(initialValue: number, finalValue: number): number {
  return (finalValue / initialValue) - 1;
}

export function maxDrawdown(nav: number[]): number {
  let peak = -Infinity;
  let maxDd = 0;
  for (const v of nav) {
    if (v > peak) peak = v;
    const dd = (peak - v) / (peak + 1e-12);
    if (dd > maxDd) maxDd = dd;
  }
  return maxDd;
}

export function simpleSharpe(returns: number[], tradingDaysPerYear = 252): number {
  if (returns.length === 0) return 0;
  const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / returns.length;
  const std = Math.sqrt(variance);
  if (std === 0) return 0;
  // annualize mean/std roughly
  return (avg * Math.sqrt(tradingDaysPerYear)) / (std + 1e-12);
}
