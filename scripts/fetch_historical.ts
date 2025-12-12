// scripts/fetch_historical.ts
// Node script to fetch daily price history from CoinGecko public API and save to CSV.
// Usage: ts-node scripts/fetch_historical.ts <coinId> <vs_currency> <days>
// Example: ts-node scripts/fetch_historical.ts bitcoin usd 365

import * as fs from "fs";
import fetch from "node-fetch";

async function fetchOHLC(coinId: string, vs = "usd", days = "365") {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vs}&days=${days}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`coingecko fetch failed ${r.status}`);
  const data = await r.json();
  // data.prices is [[timestamp, price], ...]
  // data.total_volumes, data.market_caps
  const prices = data.prices as [number, number][];
  const volumes = data.total_volumes as [number, number][];
  const lines = ["timestamp,open,high,low,close,volume"];
  // CoinGecko provides daily-ish samples; we treat price as close, open/high/low not available -> use price for O/H/L
  for (let i = 0; i < prices.length; i++) {
    const ts = new Date(prices[i][0]).toISOString();
    const price = prices[i][1];
    const volume = volumes[i] ? volumes[i][1] : 0;
    lines.push(`${ts},${price},${price},${price},${price},${volume}`);
  }
  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.log("Usage: ts-node scripts/fetch_historical.ts <coinId> <vs_currency> <days>");
    console.log("Example: ts-node scripts/fetch_historical.ts bitcoin usd 365");
    process.exit(1);
  }
  const [coinId, vs, days] = args;
  try {
    const csv = await fetchOHLC(coinId, vs, days);
    const outDir = "quant/data/token_prices";
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = `${outDir}/${coinId}.csv`;
    fs.writeFileSync(outPath, csv);
    console.log("Wrote CSV to", outPath);
  } catch (e: any) {
    console.error("Error:", e.message || e);
  }
}

main();
