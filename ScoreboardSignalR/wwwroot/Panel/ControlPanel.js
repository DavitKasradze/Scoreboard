"use strict";

let connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();

let pollIntervalId = null;
let cachedBroadcasterId = null;

// ─── Credential helpers ────────────────────────────────────────
function getCredentials() {
    return {
        channel: (document.getElementById("twitchChannelName")?.value || "").trim(),
        clientId: (document.getElementById("twitchClientId")?.value || "").trim(),
        token: (document.getElementById("twitchAccessToken")?.value || "").trim().replace(/^oauth:/, ""),
    };
}

function setStatus(text, color = "#aaa") {
    const el = document.getElementById("twitchPollStatus");
    if (el) { el.textContent = text; el.style.color = color; }
}

// ─── Build scoreboard payload from form ────────────────────────
function getScoreboardInputFromForm(predOverride = null) {
    const base = {
        clanPrefixOne: document.getElementById("clanPrefixOne").value,
        nameOne: document.getElementById("nameOne").value,
        scoreOne: parseInt(document.getElementById("scoreOne").value) || 0,
        countryOne: document.getElementById("countryOne").value,
        upcomingCharacterOne: document.getElementById("upcomingCharacterOne").value,
        clanPrefixTwo: document.getElementById("clanPrefixTwo").value,
        nameTwo: document.getElementById("nameTwo").value,
        scoreTwo: parseInt(document.getElementById("scoreTwo").value) || 0,
        countryTwo: document.getElementById("countryTwo").value,
        upcomingCharacterTwo: document.getElementById("upcomingCharacterTwo").value,
        currentRound: document.getElementById("currentRound").value,
        prizePool: document.getElementById("prizePool").value,
        upcomingPrefixOne: document.getElementById("upcomingPrefixOne").value,
        upcomingNameOne: document.getElementById("upcomingNameOne").value,
        upcomingCountryOne: document.getElementById("upcomingCountryOne").value,
        upcomingPrefixTwo: document.getElementById("upcomingPrefixTwo").value,
        upcomingNameTwo: document.getElementById("upcomingNameTwo").value,
        upcomingCountryTwo: document.getElementById("upcomingCountryTwo").value,
        upcomingRound: document.getElementById("upcomingRound").value,
    };
    return base;
}

function sendScoreboardUpdate() {
    const input = getScoreboardInputFromForm();
    connection.invoke("UpdateScoreboard", input)
        .catch(err => console.error(err));
}

// Sends ONLY prediction data — scoreboard state is never touched
function sendPredictionUpdate(payload) {
    connection.invoke("UpdatePrediction", payload)
        .catch(err => console.error(err));
}

// ─── Twitch API ────────────────────────────────────────────────
async function resolveBroadcasterId(channel, clientId, token) {
    if (/^\d+$/.test(channel)) return channel;

    const res = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(channel)}`, {
        headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Users API: ${res.status}`);
    const data = await res.json();
    if (!data.data?.length) throw new Error(`Channel "${channel}" not found`);
    return data.data[0].id;
}

async function fetchTwitchPrediction() {
    const { channel, clientId, token } = getCredentials();
    if (!clientId || !token || !channel) return;

    try {
        if (!cachedBroadcasterId) {
            cachedBroadcasterId = await resolveBroadcasterId(channel, clientId, token);
        }

        const res = await fetch(`https://api.twitch.tv/helix/predictions?broadcaster_id=${cachedBroadcasterId}&first=1`, {
            headers: { "Client-ID": clientId, "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) { setStatus(`API error ${res.status}`, "#e74c3c"); return; }

        const json = await res.json();
        if (!json.data?.length) {
            setStatus("No prediction found", "#f39c12");
            return;
        }

        const pred = json.data[0];
        const status = pred.status || "ACTIVE";       // ACTIVE | LOCKED | RESOLVED | CANCELED
        const title = pred.title || "WHO WILL WIN?";
        const outcomes = pred.outcomes || [];

        let nameOne = "PLAYER 1", nameTwo = "PLAYER 2";
        let pct1 = 50, pct2 = 50;
        let odds1 = "50% (1.00x)", odds2 = "50% (1.00x)";
        let winner = null;      // "ONE" | "TWO" | null

        if (outcomes.length >= 2) {
            nameOne = outcomes[0].title;
            nameTwo = outcomes[1].title;

            const pts1 = outcomes[0].channel_points || 0;
            const pts2 = outcomes[1].channel_points || 0;
            const total = pts1 + pts2;

            if (total > 0) {
                pct1 = Math.round((pts1 / total) * 100);
                pct2 = 100 - pct1;
                const m1 = pts1 > 0 ? (total / pts1).toFixed(2) : "N/A";
                const m2 = pts2 > 0 ? (total / pts2).toFixed(2) : "N/A";
                odds1 = `${pct1}% (${m1}x)`;
                odds2 = `${pct2}% (${m2}x)`;
            }

            // Determine winner from RESOLVED prediction
            if (status === "RESOLVED" && pred.winning_outcome_id) {
                if (outcomes[0].id === pred.winning_outcome_id) winner = "ONE";
                else if (outcomes[1].id === pred.winning_outcome_id) winner = "TWO";
            }
        }

        const isActive = document.getElementById("predictionActive")?.checked || false;

        // Only push prediction data — scoreboard fields are NOT touched
        sendPredictionUpdate({
            active: isActive,
            title: title,
            status: status,
            winner: winner,
            nameOne: nameOne,
            oddsOne: odds1,
            pctOne: pct1,
            nameTwo: nameTwo,
            oddsTwo: odds2,
            pctTwo: pct2,
        });

        // Update status panel
        const now = new Date().toLocaleTimeString();
        const infoRow = document.getElementById("predictionInfoRow");
        if (infoRow) infoRow.style.display = "";
        const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        el("predLastSync", now);
        el("predStatusInfo", status + (winner ? ` 🏆 ${winner === "ONE" ? nameOne : nameTwo}` : ""));
        el("predTitleInfo", title);

        setStatus(`✓ Synced ${now}`, "#2ecc71");

        // If resolved: auto-stop polling after 1 fetch (overlay handles 2-min timer)
        if (status === "RESOLVED" || status === "CANCELED") {
            stopPolling();
            setStatus(`${status} – auto-sync stopped`, "#f39c12");
        }

    } catch (err) {
        setStatus(`Error: ${err.message}`, "#e74c3c");
        console.error("Prediction fetch error:", err);
    }
}

function startPolling() {
    stopPolling();
    fetchTwitchPrediction();
    pollIntervalId = setInterval(fetchTwitchPrediction, 5000);
    setStatus("⟳ Syncing every 5s…", "#a970ff");
}

function stopPolling() {
    if (pollIntervalId) { clearInterval(pollIntervalId); pollIntervalId = null; }
}

// ─── Save & Start Auto-Sync button ────────────────────────────
document.getElementById("twitchSaveCredentials")?.addEventListener("click", () => {
    const creds = getCredentials();
    if (!creds.clientId || !creds.token || !creds.channel) {
        alert("Please fill in Channel Name, Client ID, and OAuth Token.");
        return;
    }
    cachedBroadcasterId = null;  // force re-resolve on new save
    
    // Save credentials to TwitchData.json
    connection.invoke("UpdateTwitchConfig", {
        twitchChannelName:  creds.channel,
        twitchClientId:     creds.clientId,
        twitchAccessToken:  creds.token,
        twitchRefreshToken: creds.refreshToken
    }).catch(err => console.error("Error saving Twitch config:", err));

    startPolling();
});

// Show overlay toggle → push ONLY prediction active state, don't update scoreboard
document.getElementById("predictionActive")?.addEventListener("change", (e) => {
    sendPredictionUpdate({ active: e.target.checked });
});

// ─── Scoreboard controls ───────────────────────────────────────
document.getElementById("updateScoreboard").addEventListener("click", () => {
    sendScoreboardUpdate();
});

document.getElementById("newSet").addEventListener("click", () => {
    ["clanPrefixOne", "nameOne", "clanPrefixTwo", "nameTwo", "prizePool", "currentRound",
        "upcomingRound", "upcomingPrefixOne", "upcomingNameOne", "upcomingPrefixTwo", "upcomingNameTwo"].forEach(id => {
            document.getElementById(id).value = "";
        });
    document.getElementById("countryOne").value = "Unknown";
    document.getElementById("countryTwo").value = "Unknown";
    document.getElementById("scoreOne").value = 0;
    document.getElementById("scoreTwo").value = 0;
    document.getElementById("upcomingCountryOne").value = "";
    document.getElementById("upcomingCountryTwo").value = "";
    document.getElementById("upcomingCharacterOne").value = "Unknown_Alt";
    document.getElementById("upcomingCharacterTwo").value = "Unknown";
});

document.getElementById("scoreReset").addEventListener("click", () => {
    document.getElementById("scoreOne").value = 0;
    document.getElementById("scoreTwo").value = 0;
});

document.getElementById("swap").addEventListener("click", () => {
    function swapValues(id1, id2) {
        const a = document.getElementById(id1), b = document.getElementById(id2);
        [a.value, b.value] = [b.value, a.value];
    }
    swapValues("clanPrefixOne", "clanPrefixTwo");
    swapValues("nameOne", "nameTwo");
    swapValues("countryOne", "countryTwo");
    swapValues("scoreOne", "scoreTwo");
});

document.getElementById("clearOne").addEventListener("click", () => {
    document.getElementById("clanPrefixOne").value = "";
    document.getElementById("nameOne").value = "";
    document.getElementById("countryOne").value = "Unknown";
    document.getElementById("scoreOne").value = 0;
});

document.getElementById("clearTwo").addEventListener("click", () => {
    document.getElementById("clanPrefixTwo").value = "";
    document.getElementById("nameTwo").value = "";
    document.getElementById("countryTwo").value = "Unknown";
    document.getElementById("scoreTwo").value = 0;
});

document.getElementById("Toggle").addEventListener("click", () => {
    connection.invoke("ToggleCharacterRender");
});

// ─── Restore state on load ─────────────────────────────────────
connection.on("ReceiveScoreboardUpdate", (input) => {
    if (!input) return;

    function setVal(id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) el.value = val;
    }

    setVal("clanPrefixOne", input.clanPrefixOne);
    setVal("nameOne", input.nameOne);
    setVal("scoreOne", input.scoreOne);
    setVal("countryOne", input.countryOne);
    setVal("upcomingCharacterOne", input.upcomingCharacterOne);
    setVal("clanPrefixTwo", input.clanPrefixTwo);
    setVal("nameTwo", input.nameTwo);
    setVal("scoreTwo", input.scoreTwo);
    setVal("countryTwo", input.countryTwo);
    setVal("upcomingCharacterTwo", input.upcomingCharacterTwo);
    setVal("currentRound", input.currentRound);
    setVal("prizePool", input.prizePool);
    setVal("upcomingPrefixOne", input.upcomingPrefixOne);
    setVal("upcomingNameOne", input.upcomingNameOne);
    setVal("upcomingCountryOne", input.upcomingCountryOne);
    setVal("upcomingPrefixTwo", input.upcomingPrefixTwo);
    setVal("upcomingNameTwo", input.upcomingNameTwo);
    setVal("upcomingCountryTwo", input.upcomingCountryTwo);
    setVal("upcomingRound", input.upcomingRound);

    const predActiveEl = document.getElementById("predictionActive");
    if (predActiveEl) predActiveEl.checked = !!input.predictionActive;
});

// ─── Twitch Config handler (from TwitchData.json) ───────────────
connection.on("ReceiveTwitchConfig", (config) => {
    if (!config) return;

    function setVal(id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) el.value = val;
    }

    setVal("twitchChannelName",  config.twitchChannelName);
    setVal("twitchClientId",     config.twitchClientId);
    setVal("twitchAccessToken",  config.twitchAccessToken);
    setVal("twitchRefreshToken", config.twitchRefreshToken);

    // Automatically start polling if credentials exist in TwitchData.json
    if (!pollIntervalId && config.twitchChannelName && config.twitchClientId && config.twitchAccessToken) {
        startPolling();
    }
});

connection.start().then(() => {
    connection.invoke("LoadSavedData").catch(err => console.error(err));
}).catch(err => console.error(err));