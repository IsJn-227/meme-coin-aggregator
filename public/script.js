// ============================
// AUTO-DETECT RENDER URL
// ============================
const BASE_URL = window.location.origin;

// Auto-fill fields as soon as page loads
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("ws-url").value = BASE_URL.replace("http", "ws");
  document.getElementById("api-url").value = BASE_URL + "/api/tokens";
});

let ws = null;

// ============================
// CONNECT WEBSOCKET
// ============================
function connectWebSocket() {
  const wsUrl = document.getElementById("ws-url").value;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    log("Connected to WebSocket", "success");
    ws.send(JSON.stringify({ type: "subscribe" }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateLiveData(data);
  };

  ws.onclose = () => log("Disconnected", "error");
  ws.onerror = (err) => log("WebSocket Error: " + err.message, "error");
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
    log("REST API OK", "success");
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
    type === "success" ? "lightgreen" : "#ddd";

  logs.prepend(entry);
}

// ============================
// UPDATE UI WITH TOKEN DATA
// ============================
function updateLiveData(data) {
  console.log("Update received:", data);
  // Add your UI rendering logic here
}
