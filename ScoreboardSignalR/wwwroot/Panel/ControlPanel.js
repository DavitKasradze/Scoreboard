"use strict";

let connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/scoreboardHub")
    .build();


document.getElementById("updateScoreboard").addEventListener("click", () => {
    const scoreboardInput = {
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
        upcomingRound: document.getElementById("upcomingRound").value 
    };

    connection.invoke("UpdateScoreboard", scoreboardInput)
        .catch(err => console.error(err));
});

document.getElementById("newSet").addEventListener("click", () => {
    document.getElementById("clanPrefixOne").value = "";
    document.getElementById("nameOne").value = "";
    document.getElementById("countryOne").value = "Unknown";
    document.getElementById("scoreOne").value = 0;

    document.getElementById("clanPrefixTwo").value = "";
    document.getElementById("nameTwo").value = "";
    document.getElementById("countryTwo").value = "Unknown";
    document.getElementById("scoreTwo").value = 0;

    document.getElementById("prizePool").value = "";
    document.getElementById("currentRound").value = "";
    document.getElementById("upcomingRound").value = "";
    document.getElementById("upcomingPrefixOne").value = "";
    document.getElementById("upcomingNameOne").value = "";
    document.getElementById("upcomingCountryOne").value = "";
    document.getElementById("upcomingCharacterOne").value = "Unknown";
    document.getElementById("upcomingPrefixTwo").value = "";
    document.getElementById("upcomingNameTwo").value = "";
    document.getElementById("upcomingCountryTwo").value = "";
    document.getElementById("upcomingCharacterTwo").value = "Unknown";
});

document.getElementById("scoreReset").addEventListener("click", () => {
    document.getElementById("scoreOne").value = 0;
    document.getElementById("scoreTwo").value = 0;
});

document.getElementById("swap").addEventListener("click", () => {
    function swapValues(id1, id2) {
        let temp = document.getElementById(id1).value;
        document.getElementById(id1).value = document.getElementById(id2).value;
        document.getElementById(id2).value = temp;
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
    connection.invoke("ToggleCharacterRender")
});

connection.start().catch(err => console.error(err));