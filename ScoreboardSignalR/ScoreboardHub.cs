using System;
using System.IO;
using System.Collections.Generic;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using ScoreboardSignalR.Models;
using Newtonsoft.Json;

namespace ScoreboardSignalR;

public class ScoreboardHub : Hub
{
    private readonly string _filePath       = GetProjectRootFilePath("scoreboardData.json");
    private readonly string _cardFilePath   = GetProjectRootFilePath("cardData.json");
    private readonly string _twitchFilePath = GetProjectRootFilePath("TwitchData.json");

    private static string GetProjectRootFilePath(string filename)
    {
        var baseDir = AppContext.BaseDirectory;
        var dir = new DirectoryInfo(baseDir);
        // Traverse up to find the project root if we are in bin/Debug etc.
        while (dir != null && !File.Exists(Path.Combine(dir.FullName, "ScoreboardSignalR.csproj")))
        {
            dir = dir.Parent;
        }
        
        var targetDir = dir?.FullName ?? baseDir;
        return Path.Combine(targetDir, filename);
    }
    
    public async Task LoadSavedData()
    {
        var scoreboardData = LoadScoreboardDataFromFile();
        await Clients.All.SendAsync("ReceiveScoreboardUpdate", scoreboardData);

        var twitchData = LoadTwitchConfigFromFile();
        await Clients.All.SendAsync("ReceiveTwitchConfig", twitchData);
    }
    
    public async Task LoadTwitchConfig()
    {
        var twitchData = LoadTwitchConfigFromFile();
        await Clients.All.SendAsync("ReceiveTwitchConfig", twitchData);
    }

    public async Task UpdateTwitchConfig(TwitchConfig config)
    {
        SaveTwitchConfigToFile(config);
        await Clients.All.SendAsync("ReceiveTwitchConfig", config);
    }

    private TwitchConfig LoadTwitchConfigFromFile()
    {
        try
        {
            if (!File.Exists(_twitchFilePath))
            {
                var defaultConfig = new TwitchConfig();
                SaveTwitchConfigToFile(defaultConfig);
                return defaultConfig;
            }
            var json = File.ReadAllText(_twitchFilePath);
            return JsonConvert.DeserializeObject<TwitchConfig>(json) ?? new TwitchConfig();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error loading Twitch config: {ex.Message}");
            return new TwitchConfig();
        }
    }

    private void SaveTwitchConfigToFile(TwitchConfig config)
    {
        try
        {
            var json = JsonConvert.SerializeObject(config, Formatting.Indented);
            File.WriteAllText(_twitchFilePath, json);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving Twitch config: {ex.Message}");
        }
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

    // ── Twitch Predictions (separate channel, does NOT touch scoreboard state) ──
    public async Task UpdatePrediction(PredictionData data)
    {
        await Clients.All.SendAsync("ReceivePredictionUpdate", data);
    }

    // ── Fight Card ──
    public async Task LoadCardData()
    {
        var cardData = LoadCardFromFile();
        await Clients.Caller.SendAsync("ReceiveCardUpdate", cardData);
    }

    public async Task UpdateCard(FightCardData input)
    {
        SaveCardToFile(input);
        await Clients.All.SendAsync("ReceiveCardUpdate", input);
    }

    private FightCardData LoadCardFromFile()
    {
        try
        {
            if (!File.Exists(_cardFilePath))
                return DefaultCard();
            var json = File.ReadAllText(_cardFilePath);
            return JsonConvert.DeserializeObject<FightCardData>(json) ?? DefaultCard();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error loading card data: {ex.Message}");
            return DefaultCard();
        }
    }

    private void SaveCardToFile(FightCardData data)
    {
        var json = JsonConvert.SerializeObject(data, Formatting.Indented);
        File.WriteAllText(_cardFilePath, json);
    }

    private static FightCardData DefaultCard() => new FightCardData
    {
        Matches = new List<FightMatch>()
    };
}