namespace MyFirstMillionAPI.Domain.Entities;

public class Account
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public decimal Balance { get; set; } = 0;
    public decimal InitialBalance { get; set; } = 0;
    public string Currency { get; set; } = "BRL";
    public string? BankName { get; set; }
    public string Color { get; set; } = "#6366F1";
    public string Icon { get; set; } = "account_balance";
    public bool IsActive { get; set; } = true;
    public bool IncludeInTotal { get; set; } = true;
    public decimal MonthlyFee { get; set; } = 0;
    public int? BillingDueDay { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = [];
}

public enum AccountType
{
    Checking,
    Savings,
    Investment,
    Cash,
    CreditCard,
    FoodCard,
    MealCard,
    TransportCard,
    GiftCard,
    Other
}
