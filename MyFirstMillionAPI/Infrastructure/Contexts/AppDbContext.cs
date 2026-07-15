using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using MyFirstMillionAPI.Domain.Entities;

namespace MyFirstMillionAPI.Infrastructure.Contexts;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<RecurringTransaction> RecurringTransactions => Set<RecurringTransaction>();
    public DbSet<FinancialGoal> FinancialGoals => Set<FinancialGoal>();
    public DbSet<GoalContribution> GoalContributions => Set<GoalContribution>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);

        /* === USER === */
        model.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        model.Entity<User>()
            .HasIndex(u => u.GoogleId).IsUnique();

        model.Entity<User>()
            .Property(u => u.RiskProfile).HasConversion<string>();

        /* === ACCOUNT === */
        model.Entity<Account>()
            .Property(a => a.Balance).HasPrecision(18, 2);

        model.Entity<Account>()
            .Property(a => a.InitialBalance).HasPrecision(18, 2);

        model.Entity<Account>()
            .Property(a => a.Type).HasConversion<string>();

        model.Entity<Account>()
            .HasOne(a => a.User)
            .WithMany(u => u.Accounts)
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        /* === CATEGORY === */
        model.Entity<Category>()
            .Property(c => c.Type).HasConversion<string>();

        model.Entity<Category>()
            .HasOne(c => c.ParentCategory)
            .WithMany(c => c.SubCategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        model.Entity<Category>()
            .HasOne(c => c.User)
            .WithMany(u => u.Categories)
            .HasForeignKey(c => c.UserId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);

        /* === TRANSACTION === */
        model.Entity<Transaction>()
            .Property(t => t.Amount).HasPrecision(18, 2);

        model.Entity<Transaction>()
            .Property(t => t.Type).HasConversion<string>();

        model.Entity<Transaction>()
            .Property(t => t.PaymentMethod).HasConversion<string>();

        model.Entity<Transaction>()
            .HasIndex(t => new { t.UserId, t.Date });

        model.Entity<Transaction>()
            .HasIndex(t => new { t.UserId, t.CategoryId });

        model.Entity<Transaction>()
            .HasOne(t => t.User)
            .WithMany(u => u.Transactions)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        model.Entity<Transaction>()
            .HasOne(t => t.Account)
            .WithMany(a => a.Transactions)
            .HasForeignKey(t => t.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        model.Entity<Transaction>()
            .HasOne(t => t.Category)
            .WithMany(c => c.Transactions)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        model.Entity<Transaction>()
            .HasOne(t => t.RecurringTransaction)
            .WithMany(r => r.Transactions)
            .HasForeignKey(t => t.RecurringTransactionId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        /* === BUDGET === */
        model.Entity<Budget>()
            .Property(b => b.PlannedAmount).HasPrecision(18, 2);

        model.Entity<Budget>()
            .HasIndex(b => new { b.UserId, b.CategoryId, b.Month, b.Year }).IsUnique();

        model.Entity<Budget>()
            .HasOne(b => b.User)
            .WithMany(u => u.Budgets)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        model.Entity<Budget>()
            .HasOne(b => b.Category)
            .WithMany(c => c.Budgets)
            .HasForeignKey(b => b.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);

        /* === RECURRING TRANSACTION === */
        model.Entity<RecurringTransaction>()
            .Property(r => r.Amount).HasPrecision(18, 2);

        model.Entity<RecurringTransaction>()
            .Property(r => r.Type).HasConversion<string>();

        model.Entity<RecurringTransaction>()
            .Property(r => r.RecurrenceType).HasConversion<string>();

        model.Entity<RecurringTransaction>()
            .HasOne(r => r.User)
            .WithMany(u => u.RecurringTransactions)
            .HasForeignKey(r => r.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        /* === FINANCIAL GOAL === */
        model.Entity<FinancialGoal>()
            .Property(g => g.TargetAmount).HasPrecision(18, 2);

        model.Entity<FinancialGoal>()
            .Property(g => g.InitialAmount).HasPrecision(18, 2);

        model.Entity<FinancialGoal>()
            .Property(g => g.MonthlyContribution).HasPrecision(18, 2);

        model.Entity<FinancialGoal>()
            .Property(g => g.ExpectedReturnRate).HasPrecision(8, 4);

        model.Entity<FinancialGoal>()
            .Property(g => g.Type).HasConversion<string>();

        model.Entity<FinancialGoal>()
            .HasOne(g => g.User)
            .WithMany(u => u.FinancialGoals)
            .HasForeignKey(g => g.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        /* === GOAL CONTRIBUTION === */
        model.Entity<GoalContribution>()
            .Property(c => c.Amount).HasPrecision(18, 2);

        model.Entity<GoalContribution>()
            .HasOne(c => c.Goal)
            .WithMany(g => g.Contributions)
            .HasForeignKey(c => c.GoalId)
            .OnDelete(DeleteBehavior.Cascade);

        /* === SEED: SYSTEM CATEGORIES === */
        SeedSystemCategories(model);
    }

    private static void SeedSystemCategories(ModelBuilder model)
    {
        var categories = new List<Category>
        {
            // Expenses
            new() { Id = 1, Name = "Moradia", Type = TransactionType.Expense, Icon = "home", Color = "#EF4444", IsSystem = true },
            new() { Id = 2, Name = "Alimentação", Type = TransactionType.Expense, Icon = "restaurant", Color = "#F97316", IsSystem = true },
            new() { Id = 3, Name = "Transporte", Type = TransactionType.Expense, Icon = "directions_car", Color = "#EAB308", IsSystem = true },
            new() { Id = 4, Name = "Saúde", Type = TransactionType.Expense, Icon = "health_and_safety", Color = "#22C55E", IsSystem = true },
            new() { Id = 5, Name = "Educação", Type = TransactionType.Expense, Icon = "school", Color = "#3B82F6", IsSystem = true },
            new() { Id = 6, Name = "Lazer", Type = TransactionType.Expense, Icon = "sports_esports", Color = "#8B5CF6", IsSystem = true },
            new() { Id = 7, Name = "Compras", Type = TransactionType.Expense, Icon = "shopping_bag", Color = "#EC4899", IsSystem = true },
            new() { Id = 8, Name = "Financeiro", Type = TransactionType.Expense, Icon = "account_balance", Color = "#6B7280", IsSystem = true },
            new() { Id = 9, Name = "Assinaturas", Type = TransactionType.Expense, Icon = "subscriptions", Color = "#14B8A6", IsSystem = true },
            new() { Id = 10, Name = "Cuidados Pessoais", Type = TransactionType.Expense, Icon = "spa", Color = "#F59E0B", IsSystem = true },
            new() { Id = 11, Name = "Outros (Despesa)", Type = TransactionType.Expense, Icon = "more_horiz", Color = "#9CA3AF", IsSystem = true },

            // Subcategories - Moradia
            new() { Id = 12, Name = "Aluguel", Type = TransactionType.Expense, Icon = "home", Color = "#EF4444", ParentCategoryId = 1, IsSystem = true },
            new() { Id = 13, Name = "Financiamento", Type = TransactionType.Expense, Icon = "apartment", Color = "#EF4444", ParentCategoryId = 1, IsSystem = true },
            new() { Id = 14, Name = "Condomínio", Type = TransactionType.Expense, Icon = "domain", Color = "#EF4444", ParentCategoryId = 1, IsSystem = true },
            new() { Id = 15, Name = "Água/Luz/Gás", Type = TransactionType.Expense, Icon = "bolt", Color = "#EF4444", ParentCategoryId = 1, IsSystem = true },
            new() { Id = 16, Name = "Manutenção", Type = TransactionType.Expense, Icon = "handyman", Color = "#EF4444", ParentCategoryId = 1, IsSystem = true },

            // Subcategories - Alimentação
            new() { Id = 17, Name = "Supermercado", Type = TransactionType.Expense, Icon = "local_grocery_store", Color = "#F97316", ParentCategoryId = 2, IsSystem = true },
            new() { Id = 18, Name = "Restaurante", Type = TransactionType.Expense, Icon = "restaurant", Color = "#F97316", ParentCategoryId = 2, IsSystem = true },
            new() { Id = 19, Name = "Delivery", Type = TransactionType.Expense, Icon = "delivery_dining", Color = "#F97316", ParentCategoryId = 2, IsSystem = true },
            new() { Id = 20, Name = "Padaria/Café", Type = TransactionType.Expense, Icon = "local_cafe", Color = "#F97316", ParentCategoryId = 2, IsSystem = true },

            // Subcategories - Transporte
            new() { Id = 21, Name = "Combustível", Type = TransactionType.Expense, Icon = "local_gas_station", Color = "#EAB308", ParentCategoryId = 3, IsSystem = true },
            new() { Id = 22, Name = "Transporte Público", Type = TransactionType.Expense, Icon = "directions_bus", Color = "#EAB308", ParentCategoryId = 3, IsSystem = true },
            new() { Id = 23, Name = "Aplicativo (Uber/99)", Type = TransactionType.Expense, Icon = "local_taxi", Color = "#EAB308", ParentCategoryId = 3, IsSystem = true },
            new() { Id = 24, Name = "Manutenção Veículo", Type = TransactionType.Expense, Icon = "build", Color = "#EAB308", ParentCategoryId = 3, IsSystem = true },
            new() { Id = 25, Name = "Estacionamento/Pedágio", Type = TransactionType.Expense, Icon = "local_parking", Color = "#EAB308", ParentCategoryId = 3, IsSystem = true },

            // Income categories
            new() { Id = 26, Name = "Salário", Type = TransactionType.Income, Icon = "payments", Color = "#10B981", IsSystem = true },
            new() { Id = 27, Name = "Freela/Autônomo", Type = TransactionType.Income, Icon = "work", Color = "#10B981", IsSystem = true },
            new() { Id = 28, Name = "Rendimentos", Type = TransactionType.Income, Icon = "trending_up", Color = "#10B981", IsSystem = true },
            new() { Id = 29, Name = "Aluguel Recebido", Type = TransactionType.Income, Icon = "real_estate_agent", Color = "#10B981", IsSystem = true },
            new() { Id = 30, Name = "Negócios", Type = TransactionType.Income, Icon = "storefront", Color = "#10B981", IsSystem = true },
            new() { Id = 31, Name = "Presente/Doação", Type = TransactionType.Income, Icon = "card_giftcard", Color = "#10B981", IsSystem = true },
            new() { Id = 32, Name = "Outros (Receita)", Type = TransactionType.Income, Icon = "more_horiz", Color = "#10B981", IsSystem = true },
        };

        model.Entity<Category>().HasData(categories);
    }
}
