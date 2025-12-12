// quant/run_backtest.ts
// CLI-ish runner for backtests.
// Usage: ts-node quant/run_backtest.ts <tokenCsvPath> <strategy> [window]
import * as path from "path";
import { loadPricesFromCSV, runBacktest } from "./backtester";
import * as fs from "fs";

function usageAndExit() {
  console.log("Usage: ts-node quant/run_backtest.ts <path/to/token.csv> <strategy> [window]");
  console.log("Example: ts-node quant/run_backtest.ts quant/data/token_prices/BTC.csv momentum 20");
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) usageAndExit();
  const csvPath = args[0];
  const strategy = args[1] as "momentum" | "meanReversion";
  const window = args[2] ? parseInt(args[2]) : 20;

  if (!fs.existsSync(csvPath)) {
    console.error("CSV not found:", csvPath);
    process.exit(1);
  }

  const prices = loadPricesFromCSV(csvPath);
  const result = runBacktest(prices, strategy, { window });

  // Persist summary JSON
  const outDir = path.join("quant", "results");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const base = path.basename(csvPath).replace(".csv", "");
  const outPath = path.join(outDir, `${base}_${strategy}_summary.json`);
  fs.writeFileSync(outPath, JSON.stringify({
    token: base,
    strategy,
    window,
    startCapital: result.startCapital,
    finalValue: result.finalValue,
    cumulativeReturn: result.cumulativeReturn,
    maxDrawdown: result.maxDrawdown,
    sharpe: result.sharpe
  }, null, 2));
  console.log("Backtest finished. Summary saved to", outPath);
}

main();
