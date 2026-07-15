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
[Route("api/accounts")]
public class AccountsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AccountsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.GetUserId();
        var accounts = await _context.Accounts
            .Where(a => a.UserId == userId && a.IsActive)
            .OrderBy(a => a.Name)
            .Select(a => new AccountDto
            {
                Id = a.Id,
                Name = a.Name,
                Type = a.Type.ToString(),
                Balance = a.Balance,
                InitialBalance = a.InitialBalance,
                Currency = a.Currency,
                BankName = a.BankName,
                Color = a.Color,
                Icon = a.Icon,
                IsActive = a.IsActive,
                IncludeInTotal = a.IncludeInTotal
            })
            .ToListAsync();

        return Ok(accounts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = User.GetUserId();
        var account = await _context.Accounts
            .Where(a => a.Id == id && a.UserId == userId)
            .FirstOrDefaultAsync();

        if (account == null) return NotFound();

        return Ok(new AccountDto
        {
            Id = account.Id,
            Name = account.Name,
            Type = account.Type.ToString(),
            Balance = account.Balance,
            InitialBalance = account.InitialBalance,
            Currency = account.Currency,
            BankName = account.BankName,
            Color = account.Color,
            Icon = account.Icon,
            IsActive = account.IsActive,
            IncludeInTotal = account.IncludeInTotal
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAccountRequest dto)
    {
        var userId = User.GetUserId();

        var account = new Account
        {
            UserId = userId,
            Name = dto.Name,
            Type = dto.Type,
            Balance = dto.InitialBalance,
            InitialBalance = dto.InitialBalance,
            Currency = dto.Currency,
            BankName = dto.BankName,
            Color = dto.Color,
            Icon = dto.Icon,
            IncludeInTotal = dto.IncludeInTotal
        };

        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = account.Id }, account.Id);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAccountRequest dto)
    {
        var userId = User.GetUserId();
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (account == null) return NotFound();

        if (dto.Name != null) account.Name = dto.Name;
        if (dto.BankName != null) account.BankName = dto.BankName;
        if (dto.Color != null) account.Color = dto.Color;
        if (dto.Icon != null) account.Icon = dto.Icon;
        if (dto.IncludeInTotal.HasValue) account.IncludeInTotal = dto.IncludeInTotal.Value;
        if (dto.IsActive.HasValue) account.IsActive = dto.IsActive.Value;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();
        var account = await _context.Accounts
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (account == null) return NotFound();

        account.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
