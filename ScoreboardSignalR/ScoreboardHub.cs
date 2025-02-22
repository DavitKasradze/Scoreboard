using System;
using System.IO;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using ScoreboardSignalR.Models;
using Newtonsoft.Json;

namespace ScoreboardSignalR;

public class ScoreboardHub : Hub
{
    private readonly string _filePath = Path.Combine(Directory.GetCurrentDirectory(), "scoreboardData.json");
    
    public async Task LoadSavedData()
    {
        var scoreboardData = LoadScoreboardDataFromFile();
        await Clients.All.SendAsync("ReceiveScoreboardUpdate", scoreboardData);
    }
    
    private ScoreboardInput LoadScoreboardDataFromFile()
    {
        try
        {
            if (!File.Exists(_filePath)) return null;
            var jsonData = File.ReadAllText(_filePath);
            return JsonConvert.DeserializeObject<ScoreboardInput>(jsonData);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error loading data: {ex.Message}");
            return null;
        }
    }
    
    public async Task UpdateScoreboard(ScoreboardInput input)
    {
        SaveScoreboardToFile(input);
        
        await Clients.All.SendAsync("ReceiveScoreboardUpdate", input);
    }
    
    private void SaveScoreboardToFile(ScoreboardInput input)
    {
        var jsonData = JsonConvert.SerializeObject(input);
        
        File.WriteAllText(_filePath, jsonData);
    }
    
    public async Task ToggleCharacterRender()
    {
        await Clients.All.SendAsync("ToggleCharacterRender");
    }
}