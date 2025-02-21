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
    
    updateElement("upcomingNameTwo", input.upcomingNameTwo);
    updateElement("upcomingPrefixTwo", input.upcomingPrefixTwo, "upcomingNameTwo", true);
    updateElement("upcomingCountryTwo", input.upcomingCountryTwo);
    updateImage("upcomingCharacterTwo", input.upcomingCharacterTwo);

    updateElement("upcomingRound", input.upcomingRound);
});

// Once the first update cycle is complete, set isFirstLoad to false
setTimeout(() => {
    isFirstLoad = false;
}, 2500);
