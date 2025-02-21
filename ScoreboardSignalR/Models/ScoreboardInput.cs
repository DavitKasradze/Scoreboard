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
}
