namespace ScoreboardSignalR.Models;

public class PredictionData
{
    public bool Active { get; set; } = false;
    public string Title { get; set; }
    public string Status { get; set; } = "ACTIVE";   // ACTIVE | LOCKED | RESOLVED | CANCELED
    public string Winner { get; set; }               // "ONE", "TWO", or null
    public string NameOne { get; set; }
    public string OddsOne { get; set; }
    public int PctOne { get; set; } = 50;
    public string NameTwo { get; set; }
    public string OddsTwo { get; set; }
    public int PctTwo { get; set; } = 50;
}
