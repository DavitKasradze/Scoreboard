"use strict";

// ─── MATCH DATA ──────────────────────────────────────────────────────────────
const CHARACTERS = [
    "Alisa","Anna", "Armor King", "Asuka", "Azucena", "Bryan", "Claudio", "Clive", "DevilJin", "Dragunov",
    "Eddy","Fakhumram", "Feng", "Heihachi", "Hwoarang", "Jack8", "Jin", "Jun", "Kazuya", "King",
    "Kuma","Kunimitsu","Lars", "Law", "Lee", "Leo", "Leroy", "Lidia", "Lili","Miary Zo", "Nina", "Panda",
    "Paul", "Raven", "Reina", "Shaheen", "Steve", "Victor", "Xiaoyu", "Yoshimitsu", "Zafina"
];

const SECTION_LABELS = { main: "Main Card", prelims: "Prelims", early: "Early Prelims" };

let cardState = []; // Will be populated by the server (single source of truth)

let selectedMatchId = 1;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function charOptions(selectedVal) {
    return CHARACTERS.map(c =>
        `<option value="${c}"${c === selectedVal ? " selected" : ""}>${c}</option>`
    ).join("");
}

function updatePreview(imgId, val) {
    const img = document.getElementById(imgId);
    if (!img || !val) return;
    // Try CharactersBig first; fall back to CharactersSmall
    img.onerror = () => { img.src = `../Images/CharactersSmall/${val}.png`; img.onerror = null; };
    img.src = `../Images/CharactersBig/${val}.png`;
}

// ─── BUILD TABS ───────────────────────────────────────────────────────────────
function buildTabs() {
    const container = document.getElementById("matchTabs");
    container.innerHTML = "";
    cardState.forEach((m) => {
        const section = m.section || "main";
        const hasResult = m.winner !== null;
        const isActive = m.id === selectedMatchId;
        const tab = document.createElement("div");
        tab.className = [
            "match-tab",
            `tab-${section}`,
            hasResult ? "finished" : "",
            isActive ? "active" : ""
        ].join(" ");
        tab.dataset.matchId = m.id;
        tab.innerHTML = `
            <div class="tab-section-badge">${SECTION_LABELS[section]}</div>
            <div class="tab-matchup">${m.p1} vs ${m.p2}</div>
            <div class="tab-score ${hasResult ? "has-result" : ""}">
                ${m.scoreP1} – ${m.scoreP2}
            </div>
        `;
        tab.addEventListener("click", () => selectMatch(m.id));
        container.appendChild(tab);
    });
}

// ─── SELECT / POPULATE EDITOR ─────────────────────────────────────────────────
function selectMatch(id) {
    selectedMatchId = id;
    const m = cardState.find(x => x.id === id);
    if (!m) return;

    const section = m.section || "main";
    document.getElementById("editorTitle").textContent =
        `Match ${id} — ${SECTION_LABELS[section]}`;

    document.getElementById("editNameP1").value = m.p1;
    document.getElementById("editNameP2").value = m.p2;
    document.getElementById("editScoreP1").value = m.scoreP1;
    document.getElementById("editScoreP2").value = m.scoreP2;

    // Populate char selects
    document.getElementById("editCharP1").innerHTML = charOptions(m.charP1);
    document.getElementById("editCharP2").innerHTML = charOptions(m.charP2);
    updatePreview("previewP1", m.charP1);
    updatePreview("previewP2", m.charP2);

    // Winner buttons
    setWinnerUI(m.winner);

    buildTabs();
}

function setWinnerUI(winner) {
    const btnP1 = document.getElementById("winnerP1Btn");
    const btnP2 = document.getElementById("winnerP2Btn");
    const btnNone = document.getElementById("winnerNoneBtn");
    btnP1.classList.toggle("selected", winner === "p1");
    btnP2.classList.toggle("selected", winner === "p2");
    btnNone.classList.toggle("selected", winner === null);

    const m = cardState.find(x => x.id === selectedMatchId);
    if (m) {
        // Update button labels to reflect current names
        btnP1.textContent = `✦ ${(m.p1 || "P1").toUpperCase()} WINS`;
        btnP2.textContent = `${(m.p2 || "P2").toUpperCase()} WINS ✦`;
        btnNone.textContent = "No Result";
    }
}

// ─── APPLY BUTTON ─────────────────────────────────────────────────────────────
document.getElementById("applyMatchBtn").addEventListener("click", () => {
    const m = cardState.find(x => x.id === selectedMatchId);
    if (!m) return;

    m.p1 = document.getElementById("editNameP1").value.trim() || m.p1;
    m.p2 = document.getElementById("editNameP2").value.trim() || m.p2;
    m.scoreP1 = parseInt(document.getElementById("editScoreP1").value) || 0;
    m.scoreP2 = parseInt(document.getElementById("editScoreP2").value) || 0;
    m.charP1 = document.getElementById("editCharP1").value;
    m.charP2 = document.getElementById("editCharP2").value;

    buildTabs();
    selectMatch(selectedMatchId);
});

// ─── RESET SINGLE MATCH ───────────────────────────────────────────────────────
document.getElementById("resetMatchBtn").addEventListener("click", () => {
    const m = cardState.find(x => x.id === selectedMatchId);
    if (!m) return;
    m.scoreP1 = 0;
    m.scoreP2 = 0;
    m.winner = null;
    selectMatch(selectedMatchId);
});

// ─── RESET ALL ────────────────────────────────────────────────────────────────
document.getElementById("resetAllBtn").addEventListener("click", () => {
    cardState.forEach(m => {
        m.scoreP1 = 0;
        m.scoreP2 = 0;
        m.winner = null;
    });
    buildTabs();
    selectMatch(selectedMatchId);
});

// ─── WINNER BUTTONS ───────────────────────────────────────────────────────────
document.getElementById("winnerP1Btn").addEventListener("click", () => {
    const m = cardState.find(x => x.id === selectedMatchId);
    if (m) { m.winner = (m.winner === "p1") ? null : "p1"; setWinnerUI(m.winner); buildTabs(); }
});
document.getElementById("winnerP2Btn").addEventListener("click", () => {
    const m = cardState.find(x => x.id === selectedMatchId);
    if (m) { m.winner = (m.winner === "p2") ? null : "p2"; setWinnerUI(m.winner); buildTabs(); }
});
document.getElementById("winnerNoneBtn").addEventListener("click", () => {
    const m = cardState.find(x => x.id === selectedMatchId);
    if (m) { m.winner = null; setWinnerUI(null); buildTabs(); }
});

// ─── CHAR PREVIEW LIVE UPDATE ─────────────────────────────────────────────────
document.getElementById("editCharP1").addEventListener("change", e => updatePreview("previewP1", e.target.value));
document.getElementById("editCharP2").addEventListener("change", e => updatePreview("previewP2", e.target.value));

// ─── SIGNALR ──────────────────────────────────────────────────────────────────
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();

document.getElementById("broadcastCardBtn").addEventListener("click", () => {
    // Also sync names from the editor into the current match before broadcasting
    const m = cardState.find(x => x.id === selectedMatchId);
    if (m) {
        m.p1 = document.getElementById("editNameP1").value.trim() || m.p1;
        m.p2 = document.getElementById("editNameP2").value.trim() || m.p2;
        m.scoreP1 = parseInt(document.getElementById("editScoreP1").value) || 0;
        m.scoreP2 = parseInt(document.getElementById("editScoreP2").value) || 0;
        m.charP1 = document.getElementById("editCharP1").value;
        m.charP2 = document.getElementById("editCharP2").value;
    }

    connection.invoke("UpdateCard", { matches: cardState })
        .then(() => {
            const btn = document.getElementById("broadcastCardBtn");
            btn.textContent = "✓ Sent!";
            setTimeout(() => btn.textContent = "📡 Broadcast Card Update", 1500);
        })
        .catch(err => console.error(err));
});

connection.on("ReceiveCardUpdate", (data) => {
    if (!data) return;
    const incomingMatches = data.matches || data.Matches;
    if (incomingMatches && incomingMatches.length > 0) {
        cardState = incomingMatches;
        // Normalise casing safely
        cardState.forEach(m => {
            m.id = m.id ?? m.Id;
            m.section = (m.section || m.Section || "main").toLowerCase();
            m.p1 = m.p1 || m.P1;
            m.p2 = m.p2 || m.P2;
            m.scoreP1 = m.scoreP1 ?? m.ScoreP1 ?? 0;
            m.scoreP2 = m.scoreP2 ?? m.ScoreP2 ?? 0;
            m.winner = m.winner || m.Winner || null;
            m.charP1 = m.charP1 || m.CharP1;
            m.charP2 = m.charP2 || m.CharP2;
        });
        buildTabs();
        selectMatch(selectedMatchId);
    }
});

connection.start()
    .then(() => {
        connection.invoke("LoadCardData").catch(err => console.error(err));
    })
    .catch(err => console.error("CardPanel SignalR error:", err));

// ─── INIT ─────────────────────────────────────────────────────────────────────
buildTabs();
selectMatch(1);
