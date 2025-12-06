// ============================
// AUTO-DETECT BACKEND URL
// ============================
const BASE_URL = window.location.origin;

// Auto-fill fields on load
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("ws-url").value = BASE_URL.replace("http", "ws");
  document.getElementById("api-url").value = BASE_URL + "/api/tokens";
});

let ws = null;
let connectionStart = null;
let updateCount = 0;

// ============================
// CONNECT TO WEBSOCKET
// ============================
function connectWebSocket() {
  const wsUrl = document.getElementById("ws-url").value;

  if (!wsUrl.startsWith("ws")) {
    log("Invalid WebSocket URL", "error");
    return;
  }

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    log("Connected to WebSocket", "success");

    connectionStart = Date.now();
    updateConnectionTime();

    ws.send(JSON.stringify({ type: "subscribe" }));

    document.getElementById("statusBox").className = "status connected";
    document.getElementById("statusBox").innerText = "🟢 Connected";
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      updateLiveData(data);
      updateCount++;
      document.getElementById("updates").innerText = updateCount;
      document.getElementById("lastUpdate").innerText = new Date().toLocaleTimeString();
    } catch (err) {
      log("Invalid WS message", "error");
    }
  };

  ws.onerror = () => {
    log("WebSocket Error", "error");
  };

  ws.onclose = () => {
    log("WebSocket Disconnected", "error");
    document.getElementById("statusBox").className = "status disconnected";
    document.getElementById("statusBox").innerText = "❌ Disconnected";
  };
}

// ============================
// DISCONNECT WS
// ============================
function disconnectWebSocket() {
  if (ws) ws.close();
}

// ============================
// TEST REST API
// ============================
async function testRestApi() {
  const url = document.getElementById("api-url").value;
  log("Testing REST API...", "info");

  try {
    const res = await fetch(url);
    const data = await res.json();
    log("REST API OK ✓", "success");
    updateLiveData(data);
  } catch (e) {
    log("REST API FAILED: " + e.message, "error");
  }
}

// ============================
// LIVE TIME COUNTER
// ============================
function updateConnectionTime() {
  if (!connectionStart) return;
  const seconds = Math.floor((Date.now() - connectionStart) / 1000);
  document.getElementById("connTime").innerText = seconds + "s";
  requestAnimationFrame(updateConnectionTime);
}

// ============================
// APPEND LOG
// ============================
function log(msg, type = "info") {
  const logs = document.getElementById("logs");
  const div = document.createElement("div");

  div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  div.style.color = type === "error" ? "red" :
                    type === "success" ? "lightgreen" : "white";

  logs.prepend(div);
}

// ============================
// RENDER TOKEN DATA
// ============================
function updateLiveData(payload) {
  if (!payload || !payload.data) return;

  const list = document.getElementById("tokenList");
  list.innerHTML = "";

  const tokens = payload.data.slice(0, 5);

  tokens.forEach(t => {
    const div = document.createElement("div");
    div.className = "token-card";
    div.innerHTML = `
      <h3>${t.token_name}</h3>
      <p>Price: ${t.price_sol}</p>
      <p>24h Change: ${t.price_1hr_change}%</p>
      <p>Volume: ${t.volume_sol} SOL</p>
      <p>Market Cap: ${t.market_cap_sol} SOL</p>
    `;
    list.appendChild(div);
  });

  document.getElementById("tokensTracked").innerText = tokens.length;
}
