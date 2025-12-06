let ws = null;
let updateCount = 0;
let startTime = null;

const log = (msg) => {
    const box = document.getElementById("logs");
    box.textContent += `[${new Date().toLocaleTimeString()}] ${msg}\n`;
    box.scrollTop = box.scrollHeight;
};

document.getElementById("connectBtn").onclick = () => {
    const wsUrl = document.getElementById("wsUrl").value;
    const restUrl = document.getElementById("restUrl").value;

    if (!wsUrl) return alert("Enter WebSocket URL");

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        log("🔌 Connected to WebSocket");
        startTime = Date.now();

        document.getElementById("statusBox").className = "status connected";
        document.getElementById("statusBox").innerText = "✅ Connected";

        ws.send(JSON.stringify({ type: "subscribe_tokens" }));
    };

    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);

        updateCount++;
        document.getElementById("updates").innerText = updateCount;
        document.getElementById("lastUpdate").innerText = new Date().toLocaleTimeString();

        if (data.tokens) {
            document.getElementById("tokensTracked").innerText = data.tokens.length;
            renderTokens(data.tokens.slice(0, 5));
        }

        log(`📊 Received update (${updateCount})`);
    };

    ws.onclose = () => {
        document.getElementById("statusBox").className = "status disconnected";
        document.getElementById("statusBox").innerText = "❌ Disconnected";
        log("❌ WebSocket disconnected");
    };

    setInterval(() => {
        if (startTime) {
            const sec = Math.floor((Date.now() - startTime) / 1000);
            document.getElementById("connTime").innerText = sec + "s";
        }
    }, 1000);
};

document.getElementById("disconnectBtn").onclick = () => {
    if (ws) ws.close();
};

document.getElementById("testRestBtn").onclick = async () => {
    const url = document.getElementById("restUrl").value;

    try {
        log("🔎 Testing REST API…");
        const res = await fetch(url);
        const json = await res.json();
        log("✅ REST OK: " + JSON.stringify(json).slice(0, 80) + "...");
    } catch (err) {
        log("❌ REST Error: " + err.message);
    }
};

// RENDER TOKEN CARDS
function renderTokens(tokens) {
    const box = document.getElementById("tokenList");
    box.innerHTML = "";

    tokens.forEach(t => {
        const div = document.createElement("div");
        div.className = "token-card";

        div.innerHTML = `
            <h3>${t.token_name}</h3>
            <p>Price: $${t.price_sol}</p>
            <p>24h Change: <span style="color:${t.price_1hr_change >= 0 ? 'green' : 'red'}">
                ${t.price_1hr_change}%
            </span></p>
            <p>Volume: ${t.volume_sol} SOL</p>
            <p>Market Cap: ${t.market_cap_sol} SOL</p>
        `;

        box.appendChild(div);
    });
}
