using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyFirstMillionAPI.Application.DTOs;
using MyFirstMillionAPI.Application.Services;
using MyFirstMillionAPI.Domain.Entities;
using MyFirstMillionAPI.Infrastructure.Contexts;
using MyFirstMillionAPI.Infrastructure.Security;

namespace MyFirstMillionAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/goals")]
public class GoalsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly InvestmentProjectionService _projection;

    public GoalsController(AppDbContext context, InvestmentProjectionService projection)
    {
        _context = context;
        _projection = projection;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.GetUserId();
        var goals = await _context.FinancialGoals
            .Where(g => g.UserId == userId)
            .Include(g => g.Contributions)
            .OrderBy(g => g.IsAchieved)
            .ThenBy(g => g.TargetDate)
            .ToListAsync();

        return Ok(goals.Select(g => new
        {
            g.Id,
            g.Name,
            Type = g.Type.ToString(),
            g.TargetAmount,
            g.InitialAmount,
            g.MonthlyContribution,
            g.ExpectedReturnRate,
            g.TargetDate,
            g.Description,
            g.Color,
            g.Icon,
            g.IsAchieved,
            g.AchievedAt,
            g.CreatedAt,
            CurrentAmount = g.Contributions.Sum(c => c.Amount),
            ProgressPercent = g.TargetAmount > 0
                ? Math.Min(100m, g.Contributions.Sum(c => c.Amount) / g.TargetAmount * 100m)
                : 0
        }));
    }

    [HttpGet("{id}/projection")]
    public async Task<IActionResult> GetProjection(int id)
    {
        var userId = User.GetUserId();
        var goal = await _context.FinancialGoals
            .Include(g => g.Contributions)
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

        if (goal == null) return NotFound();

        var currentAmount = goal.Contributions.Sum(c => c.Amount);
        var projection = _projection.ProjectGoal(goal, currentAmount);
        return Ok(projection);
    }

    [HttpGet("suggestions")]
    public async Task<IActionResult> GetInvestmentSuggestions()
    {
        var userId = User.GetUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var lastMonthIncome = await _context.Transactions
            .Where(t => t.UserId == userId
                && t.Type == TransactionType.Income
                && t.Date >= DateTime.UtcNow.AddMonths(-1))
            .SumAsync(t => t.Amount);

        var lastMonthExpenses = await _context.Transactions
            .Where(t => t.UserId == userId
                && t.Type == TransactionType.Expense
                && t.Date >= DateTime.UtcNow.AddMonths(-1))
            .SumAsync(t => t.Amount);

        var monthlySavings = lastMonthIncome - lastMonthExpenses;
        var suggestions = _projection.GetSuggestions(user.RiskProfile, Math.Max(0, monthlySavings));

        return Ok(suggestions);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGoalRequest dto)
    {
        var userId = User.GetUserId();

        var goal = new FinancialGoal
        {
            UserId = userId,
            Name = dto.Name,
            Type = dto.Type,
            TargetAmount = dto.TargetAmount,
            InitialAmount = dto.InitialAmount,
            MonthlyContribution = dto.MonthlyContribution,
            ExpectedReturnRate = dto.ExpectedReturnRate,
            TargetDate = dto.TargetDate,
            Description = dto.Description,
            Color = dto.Color,
            Icon = dto.Icon
        };

        if (dto.InitialAmount > 0)
        {
            goal.Contributions.Add(new GoalContribution
            {
                Amount = dto.InitialAmount,
                Date = DateTime.UtcNow,
                Notes = "Valor inicial"
            });
        }

        _context.FinancialGoals.Add(goal);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { }, goal.Id);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateGoalRequest dto)
    {
        var userId = User.GetUserId();
        var goal = await _context.FinancialGoals
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

        if (goal == null) return NotFound();

        if (dto.Name != null) goal.Name = dto.Name;
        if (dto.TargetAmount.HasValue) goal.TargetAmount = dto.TargetAmount.Value;
        if (dto.MonthlyContribution.HasValue) goal.MonthlyContribution = dto.MonthlyContribution.Value;
        if (dto.ExpectedReturnRate.HasValue) goal.ExpectedReturnRate = dto.ExpectedReturnRate.Value;
        if (dto.TargetDate.HasValue) goal.TargetDate = dto.TargetDate.Value;
        if (dto.Description != null) goal.Description = dto.Description;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/contributions")]
    public async Task<IActionResult> AddContribution(int id, [FromBody] AddContributionRequest dto)
    {
        var userId = User.GetUserId();
        var goal = await _context.FinancialGoals
            .Include(g => g.Contributions)
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

        if (goal == null) return NotFound();

        var contribution = new GoalContribution
        {
            GoalId = id,
            Amount = dto.Amount,
            Date = dto.Date,
            Notes = dto.Notes
        };

        goal.Contributions.Add(contribution);

        var totalContributed = goal.Contributions.Sum(c => c.Amount);
        if (totalContributed >= goal.TargetAmount && !goal.IsAchieved)
        {
            goal.IsAchieved = true;
            goal.AchievedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(new { contributionId = contribution.Id, totalContributed });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.GetUserId();
        var goal = await _context.FinancialGoals
            .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

        if (goal == null) return NotFound();

        _context.FinancialGoals.Remove(goal);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
