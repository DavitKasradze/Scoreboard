namespace ScoreboardSignalR.Models;

public class ScoreboardInput
{
    public string ClanPrefixOne { get; set; }
    public string NameOne { get; set; }
    public int ScoreOne { get; set; }
    public string CountryOne { get; set; }
    
    public string ClanPrefixTwo { get; set; }
    public string NameTwo { get; set; }
    public int ScoreTwo { get; set; }
    public string CountryTwo { get; set; }
    
    public string CurrentRound { get; set; }
    
    public string UpcomingPrefixOne { get; set; }
    public string UpcomingNameOne { get; set; }
    public string UpcomingCountryOne { get; set; }
    public string UpcomingCharacterOne { get; set; }
    public string UpcomingPrefixTwo { get; set; }
    public string UpcomingNameTwo { get; set; }
    public string UpcomingCountryTwo { get; set; }
    public string UpcomingCharacterTwo { get; set; }
    public string UpcomingRound { get; set; }
    
    public string PrizePool { get; set; }

    // Twitch Predictions
    public bool PredictionActive { get; set; } = false;
    public string PredictionTitle { get; set; }
    public string PredictionStatus { get; set; } = "ACTIVE";
    public string PredictionWinner { get; set; }   // "ONE", "TWO", or null
    public string PredictionNameOne { get; set; }
    public string PredictionOddsOne { get; set; }
    public int PredictionPctOne { get; set; } = 50;
    public string PredictionNameTwo { get; set; }
    public string PredictionOddsTwo { get; set; }
    public int PredictionPctTwo { get; set; } = 50;
}

