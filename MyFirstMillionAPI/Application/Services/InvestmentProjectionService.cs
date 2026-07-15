using MyFirstMillionAPI.Application.DTOs;
using MyFirstMillionAPI.Domain.Entities;

namespace MyFirstMillionAPI.Application.Services;

public class InvestmentProjectionService
{
    public GoalProjectionDto ProjectGoal(FinancialGoal goal, decimal currentSavedAmount)
    {
        var monthlyRate = goal.ExpectedReturnRate / 100m / 12m;
        var months = 0;
        var balance = currentSavedAmount + goal.InitialAmount;
        var projections = new List<MonthlyProjectionPoint>();
        var now = DateTime.UtcNow;

        while (balance < goal.TargetAmount && months <= 600)
        {
            balance = balance * (1 + monthlyRate) + goal.MonthlyContribution;
            months++;
            var projDate = now.AddMonths(months);

            if (months <= 24 || months % 6 == 0)
            {
                projections.Add(new MonthlyProjectionPoint
                {
                    Month = months,
                    Date = projDate,
                    ProjectedAmount = Math.Min(balance, goal.TargetAmount * 1.5m)
                });
            }
        }

        var estimatedDate = months <= 600 ? now.AddMonths(months) : (DateTime?)null;
        var monthsToGoal = months <= 600 ? months : (int?)null;

        return new GoalProjectionDto
        {
            GoalId = goal.Id,
            GoalName = goal.Name,
            TargetAmount = goal.TargetAmount,
            CurrentAmount = currentSavedAmount,
            MonthlyContribution = goal.MonthlyContribution,
            ExpectedReturnRate = goal.ExpectedReturnRate,
            EstimatedCompletionDate = estimatedDate,
            MonthsToGoal = monthsToGoal,
            ProgressPercent = goal.TargetAmount > 0
                ? Math.Min(100m, currentSavedAmount / goal.TargetAmount * 100m)
                : 0,
            Projections = projections
        };
    }

    public InvestmentSuggestionsDto GetSuggestions(RiskProfile profile, decimal monthlySavings)
    {
        return profile switch
        {
            RiskProfile.Conservative => new InvestmentSuggestionsDto
            {
                Profile = "Conservador",
                ExpectedAnnualReturn = 11.5m,
                Suggestions =
                [
                    new() { Name = "Tesouro Selic", Allocation = 40, ExpectedReturn = 10.9m, Risk = "Baixíssimo", Description = "Título público federal atrelado à Selic, liquidez diária." },
                    new() { Name = "CDB 100% CDI", Allocation = 35, ExpectedReturn = 10.9m, Risk = "Baixo", Description = "Certificado de Depósito Bancário com cobertura do FGC até R$250k." },
                    new() { Name = "LCI/LCA", Allocation = 25, ExpectedReturn = 12.0m, Risk = "Baixo", Description = "Letras de Crédito Imobiliário/Agronegócio, isentas de IR para PF." },
                ]
            },
            RiskProfile.Moderate => new InvestmentSuggestionsDto
            {
                Profile = "Moderado",
                ExpectedAnnualReturn = 14.0m,
                Suggestions =
                [
                    new() { Name = "Tesouro IPCA+", Allocation = 30, ExpectedReturn = 13.5m, Risk = "Baixo", Description = "Proteção contra inflação com rentabilidade real garantida." },
                    new() { Name = "CDB 110% CDI", Allocation = 25, ExpectedReturn = 12.0m, Risk = "Baixo", Description = "CDB com rentabilidade superior à Selic." },
                    new() { Name = "Fundos Multimercado", Allocation = 25, ExpectedReturn = 15.0m, Risk = "Médio", Description = "Diversificação em renda fixa e variável gerenciada por especialistas." },
                    new() { Name = "FIIs (Fundos Imobiliários)", Allocation = 20, ExpectedReturn = 16.0m, Risk = "Médio", Description = "Renda mensal isenta de IR com exposição ao setor imobiliário." },
                ]
            },
            RiskProfile.Aggressive => new InvestmentSuggestionsDto
            {
                Profile = "Arrojado",
                ExpectedAnnualReturn = 18.0m,
                Suggestions =
                [
                    new() { Name = "Ações Brasileiras (IBOV)", Allocation = 40, ExpectedReturn = 20.0m, Risk = "Alto", Description = "Carteira diversificada de ações do Ibovespa com potencial de valorização." },
                    new() { Name = "BDRs / ETFs Internacionais", Allocation = 20, ExpectedReturn = 18.0m, Risk = "Alto", Description = "Exposição ao mercado internacional via S&P 500, NASDAQ." },
                    new() { Name = "FIIs de Desenvolvimento", Allocation = 20, ExpectedReturn = 18.0m, Risk = "Médio-Alto", Description = "FIIs com foco em desenvolvimento imobiliário e maior valorização." },
                    new() { Name = "Tesouro IPCA+ (reserva)", Allocation = 20, ExpectedReturn = 13.5m, Risk = "Baixo", Description = "Âncora da carteira para proteção em períodos de volatilidade." },
                ]
            },
            _ => GetSuggestions(RiskProfile.Moderate, monthlySavings)
        };
    }
}
