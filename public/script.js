// ============================
// AUTO-DETECT RENDER URL
// ============================
const BASE_URL = window.location.origin;

// Auto-fill fields on load
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("ws-url").value = BASE_URL.replace("http", "ws");
  document.getElementById("api-url").value = BASE_URL + "/api";
});

let ws = null;

// ============================
// CONNECT WEBSOCKET
// ============================
function connectWebSocket() {
  const wsUrl = document.getElementById("ws-url").value;

  if (!wsUrl) {
    log("❌ WebSocket URL is empty!", "error");
    return;
  }

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    log("🟢 Connected to WebSocket", "success");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateLiveData(data);
  };

  ws.onclose = () => log("🔴 WebSocket Disconnected", "error");
  ws.onerror = (err) => log("⚠ WebSocket Error: " + err.message, "error");
}

// ============================
// DISCONNECT WEBSOCKET
// ============================
function disconnectWebSocket() {
  if (ws) {
    ws.close();
  }
}

// ============================
// TEST REST API
// ============================
async function testRestApi() {
  const baseApi = document.getElementById("api-url").value;
  const fullUrl = baseApi + "/tokens";

  log("Testing REST API…", "info");

  try {
    const res = await fetch(fullUrl);
    const data = await res.json();

    log("REST API OK ✔", "success");
    updateLiveData(data);
  } catch (e) {
    log("REST API FAILED: " + e.message, "error");
  }
}

// ============================
// LOGGING FUNCTION
// ============================
function log(message, type = "info") {
  const logs = document.getElementById("logs");
  const entry = document.createElement("div");

  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  entry.style.color =
    type === "error" ? "red" :
    type === "success" ? "lightgreen" : "#ccc";

  logs.prepend(entry);
}

// ============================
// UPDATE UI WITH TOKEN DATA
// ============================
function updateLiveData(data) {
  console.log("🔥 Live update received:", data);

  // TODO — Add UI rendering logic here (I can build a beautiful UI)
}

// ============================
// ATTACH BUTTON EVENTS
// ============================
document.getElementById("connectBtn").onclick = connectWebSocket;
document.getElementById("disconnectBtn").onclick = disconnectWebSocket;
document.getElementById("testRestBtn").onclick = testRestApi;
