namespace MyFirstMillionAPI.Domain.Entities;

public class RecurringTransaction
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int AccountId { get; set; }
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public RecurrenceType RecurrenceType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime NextDueDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = [];
}

public enum RecurrenceType
{
    Daily,
    Weekly,
    Biweekly,
    Monthly,
    Quarterly,
    Yearly
}
