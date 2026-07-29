"use strict";

let isFirstLoad = true;
let isFirstLoadDelay = window.location.pathname.includes("NextMatch.html") ? 500 : 2700;

let connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();

connection.start().then(() => {
    console.log("Connection established");

    connection.invoke("LoadSavedData")
        .catch(err => console.error(err));
}).catch(err => {
    console.error("Connection failed: ", err);
});

connection.on("ReceiveScoreboardUpdate", (input) => {
    function updateElement(id, value, prefixId = null, nextMatch = false,) {
        let element = document.getElementById(id);
        if (element) {
            let stringValue = String(value != null ? value : "");
            if (element.dataset.value === stringValue) {
                return;
            }
            element.dataset.value = stringValue;

            let delay = isFirstLoad ? isFirstLoadDelay : 1500; // 3.7s on load, 0.5s after

            element.style.transition = "opacity 0.5s";
            element.style.opacity = "0"; // Fade out

            setTimeout(() => {
                if (id === "scoreOne" || id === "scoreTwo") {
                    element.innerText = value;
                }

                element.innerText = String(value).toUpperCase();

                if (prefixId) {
                    const prefixElement = document.getElementById(prefixId);
                    if (prefixElement) {
                        const combinedLength = value.length + prefixElement.innerText.length;
                        let size, nextSize;
                        if (combinedLength > 26) {
                            size = "17px"; nextSize = "38px";
                        } else if (combinedLength > 20) {
                            size = "20px"; nextSize = "46px";
                        } else if (combinedLength > 15) {
                            size = "25px"; nextSize = "56px";
                        } else {
                            size = "30px"; nextSize = "64px";
                        }
                        prefixElement.style.fontSize = element.style.fontSize = nextMatch ? nextSize : size;
                    }
                } else {
                    let len = value.length;
                    let size;

                    if (id === "currentRound" || id === "prizePool" || id === "upcomingRound") {
                        // Base size used to be 26px, scale down progressively
                        if (len > 26) {
                            size = "15px";
                        } else if (len > 20) {
                            size = "18px";
                        } else if (len > 15) {
                            size = "22px";
                        } else {
                            size = "26px";
                        }
                    } else {
                        // Fallback logic for standalone names (without clans)
                        if (len > 26) {
                            size = "17px";
                        } else if (len > 20) {
                            size = "20px";
                        } else if (len > 15) {
                            size = "25px";
                        } else {
                            size = "30px";
                        }
                    }
                    element.style.fontSize = size;
                }

                element.style.opacity = "1"; // Fade in
            }, delay);
        }
    }

    function updateImage(id, value) {
        let element = document.getElementById(id);
        if (element) {
            let stringValue = String(value != null ? value : "");
            if (element.dataset.value === stringValue) {
                return;
            }
            element.dataset.value = stringValue;

            let delay = isFirstLoad ? isFirstLoadDelay : 1500; // 3.7s on load, 0.5s after

            element.style.transition = "opacity 0.5s";
            element.style.opacity = "0"; // Fade out

            setTimeout(() => {
                let parts = element.src.split("/");
                if (parts[parts.length - 1] !== "") {
                    parts[parts.length - 1] = "";
                }
                element.src = parts.join("/");

                element.src = element.src + value + ".png";
                element.style.opacity = '1';
            }, delay);
        }
    }

    // Check coupling for Player 1 (force update both if either changes to keep size logic in sync)
    let nameOne = document.getElementById("nameOne");
    let clanOne = document.getElementById("clanPrefixOne");
    if (nameOne && clanOne) {
        let nameOneChanged = nameOne.dataset.value !== String(input.nameOne || "");
        let clanOneChanged = clanOne.dataset.value !== String(input.clanPrefixOne || "");
        if (nameOneChanged || clanOneChanged) {
            nameOne.dataset.value = undefined;
            clanOne.dataset.value = undefined;
        }
    }

    // Check coupling for Player 2 (force update both if either changes to keep size logic in sync)
    let nameTwo = document.getElementById("nameTwo");
    let clanTwo = document.getElementById("clanPrefixTwo");
    if (nameTwo && clanTwo) {
        let nameTwoChanged = nameTwo.dataset.value !== String(input.nameTwo || "");
        let clanTwoChanged = clanTwo.dataset.value !== String(input.clanPrefixTwo || "");
        if (nameTwoChanged || clanTwoChanged) {
            nameTwo.dataset.value = undefined;
            clanTwo.dataset.value = undefined;
        }
    }

    // Check coupling for Upcoming Player 1 (force update both if either changes to keep size logic in sync)
    let upcomingNameOne = document.getElementById("upcomingNameOne");
    let upcomingPrefixOne = document.getElementById("upcomingPrefixOne");
    if (upcomingNameOne && upcomingPrefixOne) {
        let upNameOneChanged = upcomingNameOne.dataset.value !== String(input.upcomingNameOne || "");
        let upPrefixOneChanged = upcomingPrefixOne.dataset.value !== String(input.upcomingPrefixOne || "");
        if (upNameOneChanged || upPrefixOneChanged) {
            upcomingNameOne.dataset.value = undefined;
            upcomingPrefixOne.dataset.value = undefined;
        }
    }

    // Check coupling for Upcoming Player 2 (force update both if either changes to keep size logic in sync)
    let upcomingNameTwo = document.getElementById("upcomingNameTwo");
    let upcomingPrefixTwo = document.getElementById("upcomingPrefixTwo");
    if (upcomingNameTwo && upcomingPrefixTwo) {
        let upNameTwoChanged = upcomingNameTwo.dataset.value !== String(input.upcomingNameTwo || "");
        let upPrefixTwoChanged = upcomingPrefixTwo.dataset.value !== String(input.upcomingPrefixTwo || "");
        if (upNameTwoChanged || upPrefixTwoChanged) {
            upcomingNameTwo.dataset.value = undefined;
            upcomingPrefixTwo.dataset.value = undefined;
        }
    }

    // Player 1
    updateElement("nameOne", input.nameOne);
    updateElement("clanPrefixOne", input.clanPrefixOne, "nameOne");
    updateImage("scoreOne", input.scoreOne);
    updateImage("countryOne", input.countryOne);

    // Player 2
    updateElement("nameTwo", input.nameTwo);
    updateElement("clanPrefixTwo", input.clanPrefixTwo, "nameTwo");
    updateImage("scoreTwo", input.scoreTwo);
    updateImage("countryTwo", input.countryTwo);

    // Round & Prize Pool
    updateElement("currentRound", input.currentRound);
    updateElement("prizePool", input.prizePool);

    // Upcoming Match
    updateElement("upcomingNameOne", input.upcomingNameOne);
    updateElement("upcomingPrefixOne", input.upcomingPrefixOne, "upcomingNameOne", true);
    updateElement("upcomingCountryOne", input.upcomingCountryOne);
    updateImage("upcomingCharacterOne", input.upcomingCharacterOne);
    updateImage("playerRenderOne", input.upcomingCharacterOne);
    updateImage("characterPanelOne", input.upcomingCharacterOne);

    updateElement("upcomingNameTwo", input.upcomingNameTwo);
    updateElement("upcomingPrefixTwo", input.upcomingPrefixTwo, "upcomingNameTwo", true);
    updateElement("upcomingCountryTwo", input.upcomingCountryTwo);
    updateImage("upcomingCharacterTwo", input.upcomingCharacterTwo);
    updateImage("playerRenderTwo", input.upcomingCharacterTwo);
    updateImage("characterPanelTwo", input.upcomingCharacterTwo);

    updateElement("upcomingRound", input.upcomingRound);
});

// ── Prediction overlay renderer ──────────────────────────────────────
// Called exclusively from ReceivePredictionUpdate so scoreboard updates
// never accidentally overwrite the prediction overlay.
function applyPredictionUpdate(pred) {
    const predContainer = document.getElementById("predictionContainer");
    if (!predContainer) return;

    if (!pred.active) {
        predContainer.classList.add("hidden");
        return;
    }

    const isResolved = pred.status === "RESOLVED";
    const isCanceled = pred.status === "CANCELED";
    const winner     = pred.winner; // "ONE" | "TWO" | null

    predContainer.classList.remove("hidden");

    // Status badge
    const statusEl = document.getElementById("predictionStatus");
    if (statusEl) {
        if (isResolved && winner) {
            statusEl.innerText = "🏆 WINNER";
            statusEl.style.color = "#ffe066";
        } else if (isCanceled) {
            statusEl.innerText = "CANCELED";
            statusEl.style.color = "#e74c3c";
        } else if (pred.status === "LOCKED") {
            statusEl.innerText = "🔒 LOCKED";
            statusEl.style.color = "#f39c12";
        } else {
            statusEl.innerText = "TWITCH PREDICTION";
            statusEl.style.color = "#a970ff";
        }
    }

    // Title
    const titleEl = document.getElementById("predictionTitle");
    if (titleEl) titleEl.innerText = (pred.title || "WHO WILL WIN?").toUpperCase();

    // Names & odds
    const nameOneEl = document.getElementById("predictionNameOne");
    if (nameOneEl) nameOneEl.innerText = (pred.nameOne || "PLAYER 1").toUpperCase();

    const nameTwoEl = document.getElementById("predictionNameTwo");
    if (nameTwoEl) nameTwoEl.innerText = (pred.nameTwo || "PLAYER 2").toUpperCase();

    const oddsOneEl = document.getElementById("predictionOddsOne");
    if (oddsOneEl) oddsOneEl.innerText = pred.oddsOne || `${pred.pctOne ?? 50}%`;

    const oddsTwoEl = document.getElementById("predictionOddsTwo");
    if (oddsTwoEl) oddsTwoEl.innerText = pred.oddsTwo || `${pred.pctTwo ?? 50}%`;

    // Bar widths (purely visual — no text inside)
    const sideOne = document.getElementById("predictionSideOne");
    const sideTwo = document.getElementById("predictionSideTwo");
    const pct1 = pred.pctOne ?? 50;
    const pct2 = pred.pctTwo ?? (100 - pct1);
    if (sideOne) sideOne.style.width = pct1 + "%";
    if (sideTwo) sideTwo.style.width = pct2 + "%";

    // Winner highlighting — applied to label containers (always full-width)
    const labelOne = document.getElementById("predLabelOne");
    const labelTwo = document.getElementById("predLabelTwo");
    if (labelOne) labelOne.classList.remove("side-winner", "side-loser");
    if (labelTwo) labelTwo.classList.remove("side-winner", "side-loser");

    if (isResolved && winner) {
        if (winner === "ONE") {
            if (labelOne) labelOne.classList.add("side-winner");
            if (labelTwo) labelTwo.classList.add("side-loser");
        } else if (winner === "TWO") {
            if (labelTwo) labelTwo.classList.add("side-winner");
            if (labelOne) labelOne.classList.add("side-loser");
        }

        // 2-minute auto-dismiss (guard so timer only starts once)
        if (!predContainer.dataset.dismissTimer) {
            predContainer.dataset.dismissTimer = "1";
            setTimeout(() => {
                predContainer.classList.add("hidden");
                delete predContainer.dataset.dismissTimer;
            }, 120_000);
        }
    }
}

connection.on("ReceivePredictionUpdate", (pred) => {
    if (pred) applyPredictionUpdate(pred);
});

// Once the first update cycle is complete, set isFirstLoad to false
setTimeout(() => {
    isFirstLoad = false;
}, 2500);

connection.on("ToggleCharacterRender", (input) => {
    const playerOne = document.getElementById('playerRenderOne');
    const PlayerPanelOne = document.getElementById('characterPanelOne');
    const playerTwo = document.getElementById('playerRenderTwo');
    const PlayerPanelTwo = document.getElementById('characterPanelTwo');

    // Apply fade effect to hide an element
    const fadeOut = (element) => {
        element.style.transition = "opacity 0.5s";
        element.style.opacity = "0"; // Start fade out

        // Hide the element after the fade-out effect
        setTimeout(() => {
            element.style.display = "none";
        }, 500); // Match the fade-out duration
    };

    // Apply fade effect to show an element
    const fadeIn = (element) => {
        element.style.display = "block"; // Ensure element is in the layout
        element.style.opacity = "0"; // Start from invisible

        setTimeout(() => {
            element.style.transition = "opacity 0.5s";
            element.style.opacity = "1"; // Fade in after ensuring display is set
        }, 50); // Small delay ensures transition applies correctly
    };

    if (playerOne.style.display !== "none") {
        // Fade out Player 1 and upcoming Player 1
        fadeOut(playerOne);
        fadeOut(PlayerPanelOne);

        // After fade out, fade in Player 2 and upcoming Player 2
        setTimeout(() => {
            fadeIn(playerTwo);
            fadeIn(PlayerPanelTwo);
        }, 500); // Wait for fade-out to complete
    } else {
        // Fade out Player 2 and upcoming Player 2
        fadeOut(playerTwo);
        fadeOut(PlayerPanelTwo);

        // After fade out, fade in Player 1 and upcoming Player 1
        setTimeout(() => {
            fadeIn(playerOne);
            fadeIn(PlayerPanelOne);
        }, 500); // Wait for fade-out to complete
    }
});


