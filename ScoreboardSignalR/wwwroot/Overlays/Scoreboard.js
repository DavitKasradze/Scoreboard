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
    function updateElement(id, value,prefixId = null, nextMatch = false ,) {
        let element = document.getElementById(id);
        if (element) {
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
                        if (combinedLength > 15) {
                            if (nextMatch){
                                prefixElement.style.fontSize = element.style.fontSize = "44px";
                            }else{
                                prefixElement.style.fontSize = element.style.fontSize = "26px"; 
                            }
                        } else {
                            if (nextMatch){
                                prefixElement.style.fontSize = element.style.fontSize = "50px";
                            }else{
                                prefixElement.style.fontSize = element.style.fontSize = "30px";
                            }
                        }
                    }
                } else {
                    element.style.fontSize = value.length > 16 ? "22px" : "26px";
                }

                element.style.opacity = "1"; // Fade in
            }, delay);
        }
    }

    function updateImage(id, value) {
        let element = document.getElementById(id);
        if (element) {
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


