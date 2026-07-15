using MyFirstMillionAPI.Domain.Entities;

namespace MyFirstMillionAPI.Application.DTOs;

public record CreateGoalRequest(
    string Name,
    GoalType Type,
    decimal TargetAmount,
    decimal InitialAmount,
    decimal MonthlyContribution,
    decimal ExpectedReturnRate,
    DateTime TargetDate,
    string? Description,
    string Color,
    string Icon
);

public record UpdateGoalRequest(
    string? Name,
    decimal? TargetAmount,
    decimal? MonthlyContribution,
    decimal? ExpectedReturnRate,
    DateTime? TargetDate,
    string? Description
);

public record AddContributionRequest(decimal Amount, DateTime Date, string? Notes);

public class GoalProjectionDto
{
    public int GoalId { get; set; }
    public string GoalName { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public decimal MonthlyContribution { get; set; }
    public decimal ExpectedReturnRate { get; set; }
    public DateTime? EstimatedCompletionDate { get; set; }
    public int? MonthsToGoal { get; set; }
    public decimal ProgressPercent { get; set; }
    public List<MonthlyProjectionPoint> Projections { get; set; } = [];
}

public class MonthlyProjectionPoint
{
    public int Month { get; set; }
    public DateTime Date { get; set; }
    public decimal ProjectedAmount { get; set; }
}

public class InvestmentSuggestionsDto
{
    public string Profile { get; set; } = string.Empty;
    public decimal ExpectedAnnualReturn { get; set; }
    public List<InvestmentOptionDto> Suggestions { get; set; } = [];
}

public class InvestmentOptionDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Allocation { get; set; }
    public decimal ExpectedReturn { get; set; }
    public string Risk { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
