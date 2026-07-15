using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MyFirstMillionAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    PictureUrl = table.Column<string>(type: "text", nullable: true),
                    GoogleId = table.Column<string>(type: "text", nullable: true),
                    IsProfileCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    RiskProfile = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Balance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    InitialBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    BankName = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: false),
                    Icon = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IncludeInTotal = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Accounts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Icon = table.Column<string>(type: "text", nullable: false),
                    Color = table.Column<string>(type: "text", nullable: false),
                    ParentCategoryId = table.Column<int>(type: "integer", nullable: true),
                    IsSystem = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categories_Categories_ParentCategoryId",
                        column: x => x.ParentCategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Categories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FinancialGoals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    TargetAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    InitialAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    MonthlyContribution = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ExpectedReturnRate = table.Column<decimal>(type: "numeric(8,4)", precision: 8, scale: 4, nullable: false),
                    TargetDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Color = table.Column<string>(type: "text", nullable: false),
                    Icon = table.Column<string>(type: "text", nullable: false),
                    IsAchieved = table.Column<bool>(type: "boolean", nullable: false),
                    AchievedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialGoals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinancialGoals_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Budgets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    Month = table.Column<int>(type: "integer", nullable: false),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    PlannedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Budgets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Budgets_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Budgets_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RecurringTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    AccountId = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    RecurrenceType = table.Column<string>(type: "text", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    NextDueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecurringTransactions_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecurringTransactions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RecurringTransactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GoalContributions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GoalId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoalContributions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoalContributions_FinancialGoals_GoalId",
                        column: x => x.GoalId,
                        principalTable: "FinancialGoals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    AccountId = table.Column<int>(type: "integer", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    Tags = table.Column<string>(type: "text", nullable: true),
                    IsRecurring = table.Column<bool>(type: "boolean", nullable: false),
                    RecurringTransactionId = table.Column<int>(type: "integer", nullable: true),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    InstallmentNumber = table.Column<int>(type: "integer", nullable: true),
                    TotalInstallments = table.Column<int>(type: "integer", nullable: true),
                    AttachmentPath = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_RecurringTransactions_RecurringTransactionId",
                        column: x => x.RecurringTransactionId,
                        principalTable: "RecurringTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Transactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Color", "CreatedAt", "Icon", "IsActive", "IsSystem", "Name", "ParentCategoryId", "Type", "UserId" },
                values: new object[,]
                {
                    { 1, "#EF4444", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(6523), "home", true, true, "Moradia", null, "Expense", null },
                    { 2, "#F97316", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7636), "restaurant", true, true, "Alimentação", null, "Expense", null },
                    { 3, "#EAB308", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7639), "directions_car", true, true, "Transporte", null, "Expense", null },
                    { 4, "#22C55E", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7641), "health_and_safety", true, true, "Saúde", null, "Expense", null },
                    { 5, "#3B82F6", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7642), "school", true, true, "Educação", null, "Expense", null },
                    { 6, "#8B5CF6", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7645), "sports_esports", true, true, "Lazer", null, "Expense", null },
                    { 7, "#EC4899", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7646), "shopping_bag", true, true, "Compras", null, "Expense", null },
                    { 8, "#6B7280", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7648), "account_balance", true, true, "Financeiro", null, "Expense", null },
                    { 9, "#14B8A6", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7649), "subscriptions", true, true, "Assinaturas", null, "Expense", null },
                    { 10, "#F59E0B", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7651), "spa", true, true, "Cuidados Pessoais", null, "Expense", null },
                    { 11, "#9CA3AF", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7652), "more_horiz", true, true, "Outros (Despesa)", null, "Expense", null },
                    { 26, "#10B981", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7831), "payments", true, true, "Salário", null, "Income", null },
                    { 27, "#10B981", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7832), "work", true, true, "Freela/Autônomo", null, "Income", null },
                    { 28, "#10B981", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7833), "trending_up", true, true, "Rendimentos", null, "Income", null },
                    { 29, "#10B981", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7835), "real_estate_agent", true, true, "Aluguel Recebido", null, "Income", null },
                    { 30, "#10B981", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7836), "storefront", true, true, "Negócios", null, "Income", null },
                    { 31, "#10B981", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7837), "card_giftcard", true, true, "Presente/Doação", null, "Income", null },
                    { 32, "#10B981", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7845), "more_horiz", true, true, "Outros (Receita)", null, "Income", null },
                    { 12, "#EF4444", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7653), "home", true, true, "Aluguel", 1, "Expense", null },
                    { 13, "#EF4444", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7812), "apartment", true, true, "Financiamento", 1, "Expense", null },
                    { 14, "#EF4444", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7814), "domain", true, true, "Condomínio", 1, "Expense", null },
                    { 15, "#EF4444", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7815), "bolt", true, true, "Água/Luz/Gás", 1, "Expense", null },
                    { 16, "#EF4444", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7817), "handyman", true, true, "Manutenção", 1, "Expense", null },
                    { 17, "#F97316", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7818), "local_grocery_store", true, true, "Supermercado", 2, "Expense", null },
                    { 18, "#F97316", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7820), "restaurant", true, true, "Restaurante", 2, "Expense", null },
                    { 19, "#F97316", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7821), "delivery_dining", true, true, "Delivery", 2, "Expense", null },
                    { 20, "#F97316", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7823), "local_cafe", true, true, "Padaria/Café", 2, "Expense", null },
                    { 21, "#EAB308", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7824), "local_gas_station", true, true, "Combustível", 3, "Expense", null },
                    { 22, "#EAB308", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7825), "directions_bus", true, true, "Transporte Público", 3, "Expense", null },
                    { 23, "#EAB308", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7827), "local_taxi", true, true, "Aplicativo (Uber/99)", 3, "Expense", null },
                    { 24, "#EAB308", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7828), "build", true, true, "Manutenção Veículo", 3, "Expense", null },
                    { 25, "#EAB308", new DateTime(2026, 7, 15, 5, 39, 31, 997, DateTimeKind.Utc).AddTicks(7830), "local_parking", true, true, "Estacionamento/Pedágio", 3, "Expense", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_UserId",
                table: "Accounts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_CategoryId",
                table: "Budgets",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Budgets_UserId_CategoryId_Month_Year",
                table: "Budgets",
                columns: new[] { "UserId", "CategoryId", "Month", "Year" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_ParentCategoryId",
                table: "Categories",
                column: "ParentCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_UserId",
                table: "Categories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialGoals_UserId",
                table: "FinancialGoals",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GoalContributions_GoalId",
                table: "GoalContributions",
                column: "GoalId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringTransactions_AccountId",
                table: "RecurringTransactions",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringTransactions_CategoryId",
                table: "RecurringTransactions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringTransactions_UserId",
                table: "RecurringTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_AccountId",
                table: "Transactions",
                column: "AccountId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CategoryId",
                table: "Transactions",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_RecurringTransactionId",
                table: "Transactions",
                column: "RecurringTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_UserId_CategoryId",
                table: "Transactions",
                columns: new[] { "UserId", "CategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_UserId_Date",
                table: "Transactions",
                columns: new[] { "UserId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_GoogleId",
                table: "Users",
                column: "GoogleId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Budgets");

            migrationBuilder.DropTable(
                name: "GoalContributions");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "FinancialGoals");

            migrationBuilder.DropTable(
                name: "RecurringTransactions");

            migrationBuilder.DropTable(
                name: "Accounts");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
