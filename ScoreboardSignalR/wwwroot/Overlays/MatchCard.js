"use strict";

const CHARS_BIG   = "../Images/CharactersBig/";
const FALLBACK    = "Unknown.png";

// Keep a local ref to know if we need to rebuild the DOM
let currentMatchesSignature = "";

function buildRowHtml(m) {
    const isMain = m.section === "main" ? " main-fight" : "";
    return `
        <div class="fight-row${isMain}" id="match-${m.id}">
            <img class="char-big char-big-left"  id="match-${m.id}-big-p1" src="" alt="">
            <img class="char-big char-big-right" id="match-${m.id}-big-p2" src="" alt="">
            <div class="fight-row-inner">
                <div class="fighter left" id="match-${m.id}-p1">
                    <div class="fighter-info">
                        <span class="fighter-name"  id="match-${m.id}-name-p1"></span>
                        <span class="fighter-score" id="match-${m.id}-score-p1"></span>
                    </div>
                </div>
                <div class="vs-divider">
                    <span class="vs-text">VS</span>
                    <span class="score-separator">–</span>
                </div>
                <div class="fighter right" id="match-${m.id}-p2">
                    <div class="fighter-info">
                        <span class="fighter-name"  id="match-${m.id}-name-p2"></span>
                        <span class="fighter-score" id="match-${m.id}-score-p2"></span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateMatchDOM(match) {
    const mid = match.id;

    // ── Names ──
    const nameP1 = document.getElementById(`match-${mid}-name-p1`);
    const nameP2 = document.getElementById(`match-${mid}-name-p2`);
    if (nameP1) nameP1.textContent = (match.p1 || "").toUpperCase();
    if (nameP2) nameP2.textContent = (match.p2 || "").toUpperCase();

    // ── Scores ──
    const scoreP1 = document.getElementById(`match-${mid}-score-p1`);
    const scoreP2 = document.getElementById(`match-${mid}-score-p2`);
    if (scoreP1) scoreP1.textContent = match.scoreP1 ?? 0;
    if (scoreP2) scoreP2.textContent = match.scoreP2 ?? 0;

    // ── Big character renders ──
    const bigP1 = document.getElementById(`match-${mid}-big-p1`);
    const bigP2 = document.getElementById(`match-${mid}-big-p2`);
    if (bigP1) {
        const targetSrc = match.charP1 ? CHARS_BIG + match.charP1 + ".png" : "";
        if (!bigP1.src.endsWith(targetSrc.replace("../", ""))) {
            bigP1.src = targetSrc;
            bigP1.onerror = () => { bigP1.src = ""; };
        }
    }
    if (bigP2) {
        const targetSrc = match.charP2 ? CHARS_BIG + match.charP2 + ".png" : "";
        if (!bigP2.src.endsWith(targetSrc.replace("../", ""))) {
            bigP2.src = targetSrc;
            bigP2.onerror = () => { bigP2.src = ""; };
        }
    }

    // ── Winner / Loser fighter classes ──
    const fighterP1 = document.getElementById(`match-${mid}-p1`);
    const fighterP2 = document.getElementById(`match-${mid}-p2`);
    if (fighterP1 && fighterP2) {
        fighterP1.classList.remove("winner", "loser");
        fighterP2.classList.remove("winner", "loser");
        if (match.winner === "p1") {
            fighterP1.classList.add("winner");
            fighterP2.classList.add("loser");
        } else if (match.winner === "p2") {
            fighterP2.classList.add("winner");
            fighterP1.classList.add("loser");
        }
    }

    // ── Row-level classes for big render tint and score visibility ──
    const row = document.getElementById(`match-${mid}`);
    if (row) {
        row.classList.remove("p1-won","p1-lost","p2-won","p2-lost","score-hidden");
        
        // Hide score UI completely if it's 0-0
        if ((match.scoreP1 || 0) === 0 && (match.scoreP2 || 0) === 0) {
            row.classList.add("score-hidden");
        }

        if (match.winner === "p1") {
            row.classList.add("p1-won","p2-lost");
        } else if (match.winner === "p2") {
            row.classList.add("p2-won","p1-lost");
        }
    }
}

function applyCardData(cardData) {
    const incomingMatches = cardData.matches || cardData.Matches;
    if (!incomingMatches) return;

    // Normalize casing for all matches
    incomingMatches.forEach(m => {
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

    // Check if we need to regenerate the DOM (e.g. if the number/order of matches changed)
    const newSignature = incomingMatches.map(m => m.id + ":" + m.section).join(",");
    if (currentMatchesSignature !== newSignature) {
        const sections = { main: "", prelims: "", early: "" };
        incomingMatches.forEach(m => {
            if (sections[m.section] !== undefined) {
                sections[m.section] += buildRowHtml(m);
            }
        });
        document.getElementById("fights-main").innerHTML = sections.main;
        document.getElementById("fights-prelims").innerHTML = sections.prelims;
        document.getElementById("fights-early").innerHTML = sections.early;
        currentMatchesSignature = newSignature;
    }

    // Update the values inside the DOM
    incomingMatches.forEach(updateMatchDOM);
}

// ── SignalR ──
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();

connection.on("ReceiveCardUpdate", (cardData) => {
    applyCardData(cardData);
});

connection.start()
    .then(() => {
        connection.invoke("LoadCardData").catch(err => console.error(err));
    })
    .catch(err => {
        console.error("Card overlay connection failed:", err);
    });
