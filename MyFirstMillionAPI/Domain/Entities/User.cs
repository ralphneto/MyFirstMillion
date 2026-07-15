namespace MyFirstMillionAPI.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; }
    public string? PictureUrl { get; set; }
    public string? GoogleId { get; set; }
    public bool IsProfileCompleted { get; set; } = false;
    public string Currency { get; set; } = "BRL";
    public RiskProfile RiskProfile { get; set; } = RiskProfile.Moderate;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Account> Accounts { get; set; } = [];
    public ICollection<Category> Categories { get; set; } = [];
    public ICollection<Transaction> Transactions { get; set; } = [];
    public ICollection<Budget> Budgets { get; set; } = [];
    public ICollection<FinancialGoal> FinancialGoals { get; set; } = [];
    public ICollection<RecurringTransaction> RecurringTransactions { get; set; } = [];
}

public enum RiskProfile
{
    Conservative,
    Moderate,
    Aggressive
}
