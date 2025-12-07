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
  document.getElementById("ws-url").value = BASE_URL;
  document.getElementById("api-url").value = BASE_URL + "/api/tokens";

  document.getElementById("connectBtn").onclick = connectSocket;
  document.getElementById("disconnectBtn").onclick = disconnectSocket;
  document.getElementById("testRestBtn").onclick = testRestApi;
});

// ============================
// CONNECT (SOCKET.IO)
// ============================
function connectSocket() {
  const url = document.getElementById("ws-url").value;

  log(`Connecting to ${url} ...`);

  socket = io(url, {
    transports: ["websocket"],  // force websocket
  });

  socket.on("connect", () => {
    log(`Connected (id: ${socket.id})`, "success");

    connectionStart = Date.now();
    requestAnimationFrame(updateConnectionTime);

    // IMPORTANT: subscribe AFTER connection
    socket.emit("subscribe:tokens");

    setStatusConnected();
  });

  socket.on("tokens:update", (update) => {
    const tokens = update.tokens || [];
    updateLiveTokens(tokens);

    updateCount++;
    document.getElementById("updates").innerText = updateCount;
    document.getElementById("lastUpdate").innerText =
      new Date().toLocaleTimeString();
  });

  socket.on("disconnect", () => {
    log("Socket disconnected", "error");
    setStatusDisconnected();
  });

  socket.on("connect_error", (err) => {
    log("Connect Error: " + err.message, "error");
    setStatusDisconnected();
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
  setStatusDisconnected();
}

function setStatusConnected() {
  const status = document.getElementById("statusBox");
  status.className = "status connected";
  status.innerText = "🟢 Connected";
}

function setStatusDisconnected() {
  const status = document.getElementById("statusBox");
  status.className = "status disconnected";
  status.innerText = "❌ Disconnected";
  document.getElementById("connTime").innerText = "0s";
  connectionStart = null;
}

// ============================
// TEST REST API
// ============================
async function testRestApi() {
  const url = document.getElementById("api-url").value;
  log("Testing REST API...");

  try {
    const res = await fetch(url);
    const json = await res.json();

    const tokens = json.data || [];
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

  for (const t of top) {
    const div = document.createElement("div");
    div.className = "token-card";
    div.innerHTML = `
      <h3>${t.token_name || "Unknown"}</h3>
      <p>Price: ${t.price_sol ?? "?"}</p>
      <p>24h Change: ${t.price_1hr_change ?? "?"}%</p>
      <p>Volume: ${t.volume_sol ?? "?"} SOL</p>
      <p>Market Cap: ${t.market_cap_sol ?? "?"} SOL</p>
    `;
    list.appendChild(div);
  }

  document.getElementById("tokensTracked").innerText = top.length;
}
