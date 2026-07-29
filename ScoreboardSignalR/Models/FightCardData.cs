using System.Collections.Generic;

namespace ScoreboardSignalR.Models;

public class FightMatch
{
    public int Id { get; set; }
    public string Section { get; set; }
    public string P1 { get; set; }
    public string P2 { get; set; }
    public int ScoreP1 { get; set; }
    public int ScoreP2 { get; set; }
    /// <summary>"p1", "p2", or null</summary>
    public string Winner { get; set; }
    public string CharP1 { get; set; }
    public string CharP2 { get; set; }
}

public class FightCardData
{
    public List<FightMatch> Matches { get; set; } = new();
}
