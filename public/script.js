// ============================
// GLOBAL STATE
// ============================
const BASE_URL = window.location.origin;

let socket = null;
let connectionStart = null;
let updateCount = 0;

// ============================
// INITIALISE UI ON LOAD
// ============================
window.addEventListener("DOMContentLoaded", () => {
  // Autofill connection fields
  document.getElementById("ws-url").value = BASE_URL;
  document.getElementById("api-url").value = BASE_URL + "/api/tokens";

  // Wire buttons
  document.getElementById("connectBtn").addEventListener("click", connectSocket);
  document.getElementById("disconnectBtn").addEventListener("click", disconnectSocket);
  document.getElementById("testRestBtn").addEventListener("click", testRestApi);
});

// ============================
// CONNECT USING SOCKET.IO
// ============================
function connectSocket() {
  const url = document.getElementById("ws-url").value || BASE_URL;

  if (socket && socket.connected) {
    log("Already connected", "info");
    return;
  }

  log(`Connecting to ${url} ...`, "info");

  socket = io(url, {
    transports: ["websocket"],      // force websocket
  });

  socket.on("connect", () => {
    log(`Connected (id: ${socket.id})`, "success");

    connectionStart = Date.now();
    updateConnectionTime();

    // Subscribe to token updates (must match server events)
    socket.emit("subscribe:tokens");

    const status = document.getElementById("statusBox");
    status.className = "status connected";
    status.innerText = "🟢 Connected";
  });

  socket.on("tokens:update", (update) => {
    // update = { timestamp, tokens, count }
    const tokens = update.tokens || [];
    updateLiveTokens(tokens);

    updateCount++;
    document.getElementById("updates").innerText = updateCount;
    document.getElementById("lastUpdate").innerText =
      new Date().toLocaleTimeString();
  });

  socket.on("disconnect", () => {
    log("Socket disconnected", "error");
    resetStatusDisconnected();
  });

  socket.on("connect_error", (err) => {
    log("Socket connect error: " + err.message, "error");
    resetStatusDisconnected();
  });
}

// ============================
// DISCONNECT SOCKET
// ============================
function disconnectSocket() {
  if (socket) {
    socket.emit("unsubscribe:tokens");
    socket.disconnect();
    socket = null;
  }
  resetStatusDisconnected();
}

function resetStatusDisconnected() {
  const status = document.getElementById("statusBox");
  status.className = "status disconnected";
  status.innerText = "❌ Disconnected";
  connectionStart = null;
  document.getElementById("connTime").innerText = "0s";
}

// ============================
// TEST REST API
// ============================
async function testRestApi() {
  const url = document.getElementById("api-url").value;
  log("Testing REST API...", "info");

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();      // { data: [...] }

    const tokens = data.data || [];
    log(`REST API OK ✓ (${tokens.length} tokens)`, "success");
    updateLiveTokens(tokens);
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
// LOGGING
// ============================
function log(msg, type = "info") {
  const logs = document.getElementById("logs");
  const div = document.createElement("div");

  div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  div.style.color =
    type === "error" ? "red" :
    type === "success" ? "lightgreen" :
    "white";

  logs.prepend(div);
}

// ============================
// RENDER TOKEN DATA
// ============================
function updateLiveTokens(tokens) {
  const list = document.getElementById("tokenList");
  list.innerHTML = "";

  const top = tokens.slice(0, 5);

  top.forEach((t) => {
    const div = document.createElement("div");
    div.className = "token-card";
    div.innerHTML = `
      <h3>${t.token_name || t.name || "Unknown"}</h3>
      <p>Price: ${t.price_sol ?? t.price ?? "?"}</p>
      <p>24h Change: ${t.price_1hr_change ?? t.price_24h_change ?? "?"}%</p>
      <p>Volume: ${t.volume_sol ?? t.volume ?? "?"} SOL</p>
      <p>Market Cap: ${t.market_cap_sol ?? t.market_cap ?? "?"} SOL</p>
    `;
    list.appendChild(div);
  });

  document.getElementById("tokensTracked").innerText = top.length;
}
