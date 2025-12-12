Quant Research Report – Meme Coin Aggregator (Quant Extension)
Author: Ishita Jain

Section 1: Problem Understanding

QuantQuest requires building an end-to-end quantitative research workflow that includes data ingestion, strategy formulation, backtesting, and performance evaluation. To meet this requirement, I extended my production-ready Meme Coin Aggregator backend project by adding a complete Quantitative Research Module. This module supports historical data collection, technical-indicator-based strategies, a modular backtesting engine, and performance metric computation. The system is implemented in TypeScript for reproducibility.

Section 2: Data Pipeline

Historical OHLCV price data is collected using the CLI script:
npx ts-node scripts/fetch_historical.ts bitcoin usd 365

The script outputs a CSV stored at:
quant/data/token_prices/bitcoin.csv

Each row contains the following fields: Timestamp, Open, High, Low, Close, Volume. The format is compatible with standard quantitative workflows and the backtester input.

Section 3: Strategies Implemented

A. Momentum Strategy
Core idea: trend continuation — buy when short-term momentum is positive. Signal logic computes rate of change over a configurable lookback window. If the metric exceeds a threshold, the engine enters a long position; otherwise it remains neutral.

B. Mean Reversion Strategy
Core idea: price reversion to recent average. Signal logic computes a rolling moving average and deviation. If price dips below the moving average by a configurable percentage, the engine buys; it exits when price reverts above threshold.

Both strategies are modular and live in the folder quant/strategies. They follow a shared interface to simplify adding more strategies later.

Section 4: Backtesting Engine

The backtesting framework simulates trades chronologically over historical data. Main files:

quant/backtester.ts for the chronological simulation and order execution

quant/metrics.ts for computing cumulative return, drawdown, volatility and a Sharpe-like metric

quant/run_backtest.ts as the CLI runner

Outputs include JSON summary files saved to quant/results, NAV time series, and basic per-trade stats. The engine is deterministic and designed for clarity and extension.

Section 5: Results

Backtests were run on 1-year daily Bitcoin data. Example generated files:
quant/results/bitcoin_momentum_summary.json
quant/results/bitcoin_meanReversion_summary.json

Each summary contains final cumulative return, volatility approximation, maximum drawdown, Sharpe-like metric, total number of trades, and the NAV time series array. These validate the data pipeline, strategy module, and backtesting engine.

Section 6: Limitations

No transaction fees or slippage modeling

Single-asset testing only (BTC)

Fixed, simple position sizing

No walk-forward validation or out-of-sample testing

Simple indicators only; no ML models included

Section 7: Future Improvements

Planned extensions include multi-asset backtesting, volatility-adjusted position sizing, transaction cost and slippage modeling, walk-forward optimization, additional indicators (RSI, MACD, Bollinger Bands), ML-based signals, and performance optimization for large datasets.
