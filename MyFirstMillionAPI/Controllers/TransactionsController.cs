using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyFirstMillionAPI.Application.DTOs;
using MyFirstMillionAPI.Domain.Entities;
using MyFirstMillionAPI.Infrastructure.Contexts;
using MyFirstMillionAPI.Infrastructure.Security;

namespace MyFirstMillionAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/transactions")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransactionsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? year,
        [FromQuery] int? month,
        [FromQuery] int? categoryId,
        [FromQuery] int? accountId,
        [FromQuery] string? type,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var userId = User.GetUserId();
        var query = _context.Transactions
            .Where(t => t.UserId == userId)
            .Include(t => t.Category)
            .Include(t => t.Account)
            .AsQueryable();

        if (year.HasValue) query = query.Where(t => t.Date.Year == year.Value);
        if (month.HasValue) query = query.Where(t => t.Date.Month == month.Value);
        if (categoryId.HasValue) query = query.Where(t => t.CategoryId == categoryId.Value);
        if (accountId.HasValue) query = query.Where(t => t.AccountId == accountId.Value);
        if (!string.IsNullOrEmpty(type) && Enum.TryParse<TransactionType>(type, true, out var tt))
            query = query.Where(t => t.Type == tt);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TransactionDto
            {
                Id = t.Id,
                AccountId = t.AccountId,
                AccountName = t.Account.Name,
                CategoryId = t.CategoryId,
                CategoryName = t.Category.Name,
                CategoryIcon = t.Category.Icon,
                CategoryColor = t.Category.Color,
                Amount = t.Amount,
                Type = t.Type.ToString(),
                Date = t.Date,
                Description = t.Description,
                Notes = t.Notes,
                Tags = t.Tags,
                PaymentMethod = t.PaymentMethod.ToString(),
                InstallmentNumber = t.InstallmentNumber,
                TotalInstallments = t.TotalInstallments,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] int year, [FromQuery] int month)
    {
        var userId = User.GetUserId();

        var transactions = await _context.Transactions
            .Where(t => t.UserId == userId && t.Date.Year == year && t.Date.Month == month)
            .Include(t => t.Category)
            .ToListAsync();

        var totalIncome = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);
        var balance = totalIncome - totalExpenses;
        var savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100m : 0;

        var topExpenses = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .GroupBy(t => t.Category)
            .Select(g => new CategoryBreakdownDto
            {
                CategoryId = g.Key.Id,
                CategoryName = g.Key.Name,
                CategoryIcon = g.Key.Icon,
                CategoryColor = g.Key.Color,
                Amount = g.Sum(t => t.Amount),
                Percentage = totalExpenses > 0 ? g.Sum(t => t.Amount) / totalExpenses * 100m : 0
            })
            .OrderByDescending(c => c.Amount)
            .Take(5)
            .ToList();

        var topIncome = transactions
            .Where(t => t.Type == TransactionType.Income)
            .GroupBy(t => t.Category)
            .Select(g => new CategoryBreakdownDto
            {
                CategoryId = g.Key.Id,
                CategoryName = g.Key.Name,
                CategoryIcon = g.Key.Icon,
                CategoryColor = g.Key.Color,
                Amount = g.Sum(t => t.Amount),
                Percentage = totalIncome > 0 ? g.Sum(t => t.Amount) / totalIncome * 100m : 0
            })
            .OrderByDescending(c => c.Amount)
            .Take(5)
            .ToList();

        var monthlyFlow = await _context.Transactions
            .Where(t => t.UserId == userId && t.Date.Year >= DateTime.UtcNow.Year - 1)
            .GroupBy(t => new { t.Date.Year, t.Date.Month })
            .Select(g => new MonthlyFlowDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Label = $"{g.Key.Month:D2}/{g.Key.Year}",
                Income = g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                Expenses = g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount),
                Balance = g.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount)
                         - g.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount)
            })
            .OrderBy(m => m.Year).ThenBy(m => m.Month)
            .ToListAsync();

        return Ok(new TransactionSummaryDto
        {
            TotalIncome = totalIncome,
            TotalExpenses = totalExpenses,
            Balance = balance,
            SavingsRate = savingsRate,
            TopExpenseCategories = topExpenses,
            TopIncomeCategories = topIncome,
            MonthlyFlow = monthlyFlow
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTransactionRequest dto)
    {
        var userId = User.GetUserId();

        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == dto.AccountId && a.UserId == userId);
        if (account == null) return BadRequest("Conta não encontrada.");

        int installments = dto.TotalInstallments > 1 ? dto.TotalInstallments!.Value : 1;
        decimal installmentAmount = Math.Round(dto.Amount / installments, 2);

        for (int i = 1; i <= installments; i++)
        {
            var transaction = new Transaction
            {
                UserId = userId,
                AccountId = dto.AccountId,
                CategoryId = dto.CategoryId,
                Amount = installmentAmount,
                Type = dto.Type,
                Date = dto.Date.AddMonths(i - 1),
                Description = installments > 1
                    ? $"{dto.Description} ({i}/{installments})"
                    : dto.Description,
                Notes = dto.Notes,
                Tags = dto.Tags,
                PaymentMethod = dto.PaymentMethod,
                InstallmentNumber = installments > 1 ? i : dto.InstallmentNumber,
                TotalInstallments = installments > 1 ? installments : dto.TotalInstallments
            };
            _context.Transactions.Add(transaction);
        }

        // Update account balance by total amount
        account.Balance += dto.Type == TransactionType.Income ? dto.Amount : -dto.Amount;

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { }, new { installments });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateTransactionRequest dto)
    {
        var userId = User.GetUserId();
        var transaction = await _context.Transactions
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction == null) return NotFound();

        // Revert old balance effect
        transaction.Account.Balance -= transaction.Type == TransactionType.Income
            ? transaction.Amount : -transaction.Amount;

        if (dto.AccountId.HasValue && dto.AccountId != transaction.AccountId)
        {
            var newAccount = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == dto.AccountId && a.UserId == userId);
            if (newAccount == null) return BadRequest("Conta não encontrada.");
            transaction.AccountId = dto.AccountId.Value;
            transaction.Account = newAccount;
        }

        if (dto.CategoryId.HasValue) transaction.CategoryId = dto.CategoryId.Value;
        if (dto.Amount.HasValue) transaction.Amount = dto.Amount.Value;
        if (dto.Date.HasValue) transaction.Date = dto.Date.Value;
        if (dto.Description != null) transaction.Description = dto.Description;
        if (dto.Notes != null) transaction.Notes = dto.Notes;
        if (dto.Tags != null) transaction.Tags = dto.Tags;
        if (dto.PaymentMethod.HasValue) transaction.PaymentMethod = dto.PaymentMethod.Value;

        // Apply new balance effect
        transaction.Account.Balance += transaction.Type == TransactionType.Income
            ? transaction.Amount : -transaction.Amount;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();
        var transaction = await _context.Transactions
            .Include(t => t.Account)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction == null) return NotFound();

        transaction.Account.Balance -= transaction.Type == TransactionType.Income
            ? transaction.Amount : -transaction.Amount;

        _context.Transactions.Remove(transaction);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
