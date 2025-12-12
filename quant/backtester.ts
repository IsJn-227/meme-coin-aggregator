// quant/backtester.ts
import * as fs from "fs";
import { momentumSignal } from "./strategies/momentum";
import { meanReversionSignal } from "./strategies/meanReversion";
import { pctReturns, cumulativeReturn, maxDrawdown, simpleSharpe } from "./metrics";

type PriceRow = { timestamp: string; close: number };

// Simple CSV loader for files in quant/data/token_prices/<TOKEN>.csv
export function loadPricesFromCSV(path: string): PriceRow[] {
  const txt = fs.readFileSync(path, "utf-8");
  const lines = txt.trim().split(/\r?\n/);
  // Expect header: timestamp,open,high,low,close,volume
  const rows: PriceRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 5) continue;
    const timestamp = cols[0];
    const close = parseFloat(cols[4]);
    if (isNaN(close)) continue;
    rows.push({ timestamp, close });
  }
  return rows;
}

/**
 * Very simple long-only backtester.
 * - startCapital: initial cash (e.g., 10000)
 * - positionSizing: full capital when long, 0 when flat (very simple)
 * - txCost: fixed percent per trade (0.001 => 0.1%)
 */
export function runBacktest(
  prices: PriceRow[],
  strategyName: "momentum" | "meanReversion" = "momentum",
  strategyParams: any = {},
  startCapital = 10000,
  txCost = 0.0005
) {
  const closes = prices.map((p) => p.close);
  const nav: number[] = []; // portfolio net asset value over time
  const positionQtys: number[] = []; // optional: track qty
  let cash = startCapital;
  let position = 0; // number of tokens held
  let lastPrice = closes[0];

  for (let t = 0; t < closes.length; t++) {
    const windowed = closes.slice(0, t + 1);
    let signal = 0;
    if (strategyName === "momentum") {
      signal = momentumSignal(windowed, strategyParams.window ?? 20);
    } else {
      signal = meanReversionSignal(windowed, strategyParams.window ?? 20, strategyParams.k ?? 2);
    }

    const price = closes[t];

    // Simple execution logic:
    // If signal == 1 => ensure we are fully long (buy with all cash)
    // If signal == 0 or -1 => ensure we are flat (sell all)
    if (signal === 1 && position === 0) {
      // buy
      const qty = cash / price;
      const cost = qty * price * (1 + txCost);
      position = qty;
      cash = 0;
    } else if ((signal === 0 || signal === -1) && position > 0) {
      // sell
      const proceeds = position * price * (1 - txCost);
      cash = proceeds;
      position = 0;
    }

    const portfolioValue = cash + position * price;
    nav.push(portfolioValue);
    positionQtys.push(position);
    lastPrice = price;
  }

  const returns = pctReturns(nav);
  const finalValue = nav[nav.length - 1] ?? startCapital;
  const cumRet = cumulativeReturn(startCapital, finalValue);
  const mdd = maxDrawdown(nav);
  const sharpe = simpleSharpe(returns);

  return {
    startCapital,
    finalValue,
    cumulativeReturn: cumRet,
    maxDrawdown: mdd,
    sharpe,
    NAV: nav,
    timestamps: prices.map((p) => p.timestamp),
    positions: positionQtys,
  };
}
