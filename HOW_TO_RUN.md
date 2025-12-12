HOW TO RUN – Quant Module of Meme Coin Aggregator

This file explains how to fetch historical data and run the backtests.

Install dependencies
From the project root, run:
npm install

Fetch historical price data
Example (Bitcoin, 365 days):
npx ts-node scripts/fetch_historical.ts bitcoin usd 365

This will create:
quant/data/token_prices/bitcoin.csv

Run the Momentum strategy backtest
Command:
npx ts-node quant/run_backtest.ts quant/data/token_prices/bitcoin.csv momentum 20

Results saved to:
quant/results/bitcoin_momentum_summary.json

Run the Mean Reversion strategy backtest
Command:
npx ts-node quant/run_backtest.ts quant/data/token_prices/bitcoin.csv meanReversion 20

Results saved to:
quant/results/bitcoin_meanReversion_summary.json

Notes on arguments

First argument is the path to the CSV price file (quant/data/token_prices/...)

Second argument is the strategy name (momentum or meanReversion)

Third argument is a strategy parameter (for example a lookback window in days)

Example usage:
npx ts-node quant/run_backtest.ts quant/data/token_prices/bitcoin.csv momentum 30

Project structure overview
quant/
data/
token_prices/
results/
bitcoin_momentum_summary.json
bitcoin_meanReversion_summary.json
strategies/
momentum.ts
meanReversion.ts
backtester.ts
metrics.ts
run_backtest.ts

Interpreting outputs
The JSON summary files include cumulative return, drawdown, volatility approximation, Sharpe-like ratio, number of trades, and NAV series. Use the NAV series to plot performance or compute additional statistics externally.
