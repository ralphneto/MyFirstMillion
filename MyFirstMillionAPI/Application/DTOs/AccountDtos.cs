using MyFirstMillionAPI.Domain.Entities;

namespace MyFirstMillionAPI.Application.DTOs;

public record CreateAccountRequest(
    string Name,
    AccountType Type,
    decimal InitialBalance,
    string Currency,
    string? BankName,
    string Color,
    string Icon,
    bool IncludeInTotal
);

public record UpdateAccountRequest(
    string? Name,
    string? BankName,
    string? Color,
    string? Icon,
    bool? IncludeInTotal,
    bool? IsActive
);

public class AccountDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public decimal InitialBalance { get; set; }
    public string Currency { get; set; } = "BRL";
    public string? BankName { get; set; }
    public string Color { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool IncludeInTotal { get; set; }
}
