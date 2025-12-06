const API_URL = "/api/tokens"; 
// backend routes prefixed with /api already

async function loadTokens() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const tbody = document.getElementById("tokenBody");

        data.data.forEach(token => {
            const row = `
                <tr>
                    <td>${token.token_name}</td>
                    <td>${token.token_ticker}</td>
                    <td>${token.price_sol?.toFixed(4) || "-"}</td>
                    <td>${token.volume_sol?.toFixed(2) || "-"}</td>
                    <td>${token.liquidity_sol?.toFixed(2) || "-"}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML("beforeend", row);
        });

        document.getElementById("loader").classList.add("hidden");
        document.getElementById("tokenTable").classList.remove("hidden");

    } catch (err) {
        document.getElementById("loader").textContent = "Failed to load tokens.";
        console.error(err);
    }
}

loadTokens();
