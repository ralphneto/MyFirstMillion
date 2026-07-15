using MyFirstMillionAPI.Domain.Entities;

namespace MyFirstMillionAPI.Application.DTOs;

public record CreateTransactionRequest(
    int AccountId,
    int CategoryId,
    decimal Amount,
    TransactionType Type,
    DateTime Date,
    string Description,
    string? Notes,
    string? Tags,
    PaymentMethod PaymentMethod,
    int? InstallmentNumber,
    int? TotalInstallments
);

public record UpdateTransactionRequest(
    int? AccountId,
    int? CategoryId,
    decimal? Amount,
    DateTime? Date,
    string? Description,
    string? Notes,
    string? Tags,
    PaymentMethod? PaymentMethod
);

public class TransactionDto
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public string AccountName { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string? Tags { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public int? InstallmentNumber { get; set; }
    public int? TotalInstallments { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class TransactionSummaryDto
{
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal Balance { get; set; }
    public decimal SavingsRate { get; set; }
    public List<CategoryBreakdownDto> TopExpenseCategories { get; set; } = [];
    public List<CategoryBreakdownDto> TopIncomeCategories { get; set; } = [];
    public List<MonthlyFlowDto> MonthlyFlow { get; set; } = [];
}

public class CategoryBreakdownDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal Percentage { get; set; }
}

public class MonthlyFlowDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public string Label { get; set; } = string.Empty;
    public decimal Income { get; set; }
    public decimal Expenses { get; set; }
    public decimal Balance { get; set; }
}
