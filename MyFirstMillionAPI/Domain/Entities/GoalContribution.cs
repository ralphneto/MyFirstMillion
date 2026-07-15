namespace MyFirstMillionAPI.Domain.Entities;

public class GoalContribution
{
    public int Id { get; set; }
    public int GoalId { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public FinancialGoal Goal { get; set; } = null!;
}
