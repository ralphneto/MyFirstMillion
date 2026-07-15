namespace MyFirstMillionAPI.Domain.Entities;

public class FinancialGoal
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public GoalType Type { get; set; } = GoalType.Custom;
    public decimal TargetAmount { get; set; }
    public decimal InitialAmount { get; set; } = 0;
    public decimal MonthlyContribution { get; set; } = 0;
    public decimal ExpectedReturnRate { get; set; } = 0;
    public DateTime TargetDate { get; set; }
    public string? Description { get; set; }
    public string Color { get; set; } = "#10B981";
    public string Icon { get; set; } = "emoji_events";
    public bool IsAchieved { get; set; } = false;
    public DateTime? AchievedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<GoalContribution> Contributions { get; set; } = [];
}

public enum GoalType
{
    FirstMillion,
    Retirement,
    EmergencyFund,
    RealEstate,
    Travel,
    Education,
    Vehicle,
    Custom
}
