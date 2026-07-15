namespace MyFirstMillionAPI.Domain.Entities;

public class Transaction
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int AccountId { get; set; }
    public int CategoryId { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? Tags { get; set; }
    public bool IsRecurring { get; set; } = false;
    public int? RecurringTransactionId { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Other;
    public int? InstallmentNumber { get; set; }
    public int? TotalInstallments { get; set; }
    public string? AttachmentPath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public RecurringTransaction? RecurringTransaction { get; set; }
}

public enum PaymentMethod
{
    Cash,
    DebitCard,
    CreditCard,
    BankTransfer,
    Pix,
    Boleto,
    Other
}
