# 🚀 Meme Coin Aggregator - Real-time Data Service

Real-time meme coin data aggregation service with WebSocket support and REST API.

### 🌍 Live Deployment

**Public URL:** https://meme-coin-aggregator-project.onrender.com  

- **REST API:** https://meme-coin-aggregator-project.onrender.com/api/tokens  
- **WebSocket (Socket.IO):** wss://meme-coin-aggregator-project.onrender.com/socket.io/  
- **Health Check:** https://meme-coin-aggregator-project.onrender.com/health

## 📹 Demo Video

**YouTube Demo:** https://www.youtube.com/watch?v=Y0paFe_O4hQ&t=21s

## 🏗️ Architecture & Design Decisions

### **1. Technology Stack**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js (lightweight, production-ready)
- **WebSocket:** Socket.IO (reliable, handles reconnection automatically)
- **Cache:** Redis with ioredis (fast in-memory caching)
- **HTTP Client:** Axios (built-in retry logic)

### **2. Data Aggregation Strategy**
- **Multiple Sources:** DexScreener + Jupiter APIs
- **Deduplication:** Tokens merged by address to avoid duplicates
- **Rate Limiting:** Exponential backoff (1s, 2s, 4s, 8s delays)
- **Caching:** 30-second TTL to reduce API calls by ~95%

### **3. Real-time Updates**
- **WebSocket Pattern:** Subscribe/publish model
- **Update Interval:** 30 seconds (configurable)
- **Event Types:**
  - `subscribe:tokens` - Client subscribes to updates
  - `tokens:update` - Server pushes new data
  - `unsubscribe:tokens` - Client unsubscribes

### **4. Scalability Approach**
- **Horizontal Scaling:** Stateless design allows multiple instances
- **Redis Cache:** Shared cache across instances
- **Connection Pooling:** Reuses HTTP connections
- **Graceful Shutdown:** Cleans up connections on SIGTERM

### **5. Error Handling**
- **Circuit Breaker Pattern:** Stops calling failing APIs temporarily
- **Retry Logic:** 3 attempts with exponential backoff
- **Fallback Data:** Returns cached data if APIs fail
- **Client Resilience:** Auto-reconnect on WebSocket disconnection

## 🚀 Quick Start

### **Installation**
```bash
git clone https://github.com/IsJn-227/meme-coin-aggregator.git
cd meme-coin-aggregator
npm install
```

### **Environment Setup**
Create `.env` file:
```env
PORT=3000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
CACHE_TTL=30
```

### **Run Locally**
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 📡 API Documentation

### **REST Endpoints**

#### **GET /health**
Check server status
```bash
curl https://meme-coin-aggregator-e8er.onrender.com/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-08T16:42:30.110Z"
}
```

#### **GET /api/tokens**
Get paginated token list

**Query Parameters:**
- `limit` (number, default: 20)
- `cursor` (string)
- `sortBy` (string) — `volume_sol`, `market_cap_sol`, `price_1hr_change`
- `sortOrder` — `asc` or `desc`
- `timePeriod` — `1h`, `24h`, `7d`

**Example:**
```bash
curl "https://meme-coin-aggregator-e8er.onrender.com/api/tokens?limit=10&sortBy=volume_sol&sortOrder=desc"
```

### **WebSocket Events**

#### **Connect to WebSocket**
```javascript
const socket = io('https://meme-coin-aggregator-e8er.onrender.com');
```

#### **Subscribe to Updates**
```javascript
socket.emit('subscribe:tokens');
```

#### **Receive Updates**
```javascript
socket.on('tokens:update', (data) => {
  console.log('Received tokens:', data.tokens);
  console.log('Timestamp:', data.timestamp);
});
```

#### **Unsubscribe**
```javascript
socket.emit('unsubscribe:tokens');
```

## 🧪 Testing

### **Run Tests**
```bash
npm test

# With coverage
npm run test:coverage
```

### **Test Coverage**
- Unit tests: Services, controllers, utilities  
- Integration tests: API endpoints, WebSocket connections  
- Edge cases: Rate limiting, error handling, cache failures  

## 📦 Postman Collection

Import the collection from: `postman_collection.json`

**Included Requests:**
1. Health Check  
2. Get All Tokens  
3. Get Tokens with Pagination  
4. Get Tokens Sorted by Volume  
5. Get Tokens with Time Period Filter  
6. Rapid API Calls (5x)  
7. Error Handling Tests  

## 🛠️ Development

### **Project Structure**
```
src/
├── config/
├── controllers/
├── routes/
├── services/
│   ├── tokenService.ts
│   ├── cacheService.ts
│   ├── websocketService.ts
│   ├── dexScreenerService.ts
│   └── jupiterService.ts
├── websocket/
├── utils/
├── types/
└── index.ts
```

### **Key Files**
- `index.ts` — Server initialization  
- `services/websocketService.ts` — WebSocket logic  
- `services/tokenService.ts` — Data aggregation  
- `services/cacheService.ts` — Redis caching  

## 📊 Performance Metrics

- **API Response Time:** <200ms (with cache)  
- **WebSocket Update Interval:** 30s  
- **Cache Hit Rate:** ~95%  
- **Supports:** 100+ concurrent clients  

## 🔒 Security

- Helmet.js  
- CORS  
- Rate limiting  
- Input validation  
- Sanitized responses  

---

# 📈 Quant Module (New)

A complete quantitative research + backtesting engine integrated into the project.

## **1. Fetch Historical Price Data**
```bash
npx ts-node scripts/fetch_historical.ts bitcoin usd 365
```
Saved to:
```
quant/data/token_prices/bitcoin.csv
```

## **2. Supported Strategies**
- **Momentum Strategy** (`quant/strategies/momentum.ts`)  
- **Mean Reversion Strategy** (`quant/strategies/meanReversion.ts`)  

## **3. Run a Backtest**
```bash
npx ts-node quant/run_backtest.ts quant/data/token_prices/bitcoin.csv momentum 20
```
Outputs saved to:
```
quant/results/
```

## **4. Quant Folder Structure**
```
quant/
├── data/
│   └── token_prices/
├── results/
├── strategies/
│   ├── momentum.ts
│   └── meanReversion.ts
├── backtester.ts
├── metrics.ts
└── run_backtest.ts
```

## **5. Metrics Provided**
- **Cumulative Return**  
- **Max Drawdown**  
- **Sharpe-like Ratio**  
- **NAV Curve**  

This quant module demonstrates real-world quant engineering: data ingestion, signal generation, backtesting engine design, and portfolio simulation.

---

## 📝 License

MIT

## 👤 Author

Ishita Jain

## 🤝 Contributing

PRs welcome! Please run tests before submitting.
