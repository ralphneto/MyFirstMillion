# MyFirstMillion — Documentação de Arquitetura

Aplicação web e mobile para controle de despesas/receitas e sugestões de investimentos para alcançar R$ 1.000.000 em economias.

**Produção:** https://www.myfirstmillion.com.br  
**Hospedagem:** AWS Lightsail (mesmo servidor do MyPetUniverse — 44.202.204.189)  
**Banco de dados:** PostgreSQL compartilhado no Lightsail (database: `myfirstmillion`)

---

## Estrutura do Projeto

```
MyFirstMillion/
├── MyFirstMillionAPI/           # ASP.NET Core 10 REST API
├── MyFirstMillionAPI.Tests/     # testes xUnit
├── MyFirstMillionSPA/           # Angular 19 SPA
│   └── my-first-million/
├── CLAUDE.md
├── deploy.sh                    # orquestrador (api|frontend|all)
├── deploy-api.sh                # Docker → Docker Hub → Lightsail
├── deploy-frontend.sh           # Angular build → SCP → Nginx
└── .env.deploy.example          # template de credenciais
```

---

## Backend (ASP.NET Core 10)

### Comandos

```bash
# Build
cd MyFirstMillionAPI
dotnet build

# Run local (requer banco local)
dotnet run

# Migrations
dotnet ef migrations add <NomeDaMigration> --output-dir Migrations
dotnet ef database update

# Build Docker
docker build -t ralphneto/myfirstmillion-api:latest .
```

### Stack

| Pacote | Versão | Uso |
|--------|--------|-----|
| ASP.NET Core | 10.0 | Framework web |
| Entity Framework Core | 10.0.1 | ORM |
| Npgsql.EF.PostgreSQL | 10.0.0 | Driver PostgreSQL |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.1 | Autenticação JWT |
| Google.Apis.Auth | 1.73.0 | Validação token Google |
| BCrypt.Net-Next | 4.0.3 | Hash de senhas |
| Serilog.AspNetCore | 10.0.0 | Logging estruturado |
| Swashbuckle.AspNetCore | 10.1.0 | Swagger/OpenAPI |
| OpenAI | 2.8.0 | Preparado para futura integração LLM |

### Arquitetura de pastas

```
MyFirstMillionAPI/
├── Controllers/
│   ├── AuthController.cs        # POST /api/auth/google, /login, /register, /complete-profile
│   ├── AccountsController.cs    # CRUD de contas financeiras
│   ├── TransactionsController.cs # CRUD + summary + filtros
│   ├── CategoriesController.cs  # Categorias de receita/despesa
│   └── GoalsController.cs       # Metas + projeções + sugestões
├── Domain/Entities/
│   ├── User.cs                  # Usuário + RiskProfile enum
│   ├── Account.cs               # Conta bancária/carteira
│   ├── Category.cs              # Categoria com suporte a subcategorias
│   ├── Transaction.cs           # Transação (receita ou despesa)
│   ├── RecurringTransaction.cs  # Template de transação recorrente
│   ├── Budget.cs                # Orçamento mensal por categoria
│   ├── FinancialGoal.cs         # Meta financeira (ex: Primeiro Milhão)
│   └── GoalContribution.cs      # Aportes para uma meta
├── Application/
│   ├── Services/
│   │   ├── IJwtService.cs / JwtService.cs
│   │   ├── GoogleTokenValidator.cs
│   │   └── InvestmentProjectionService.cs  # Projeção juros compostos + sugestões
│   └── DTOs/
│       ├── AuthDtos.cs
│       ├── TransactionDtos.cs
│       ├── AccountDtos.cs
│       └── GoalDtos.cs
└── Infrastructure/
    ├── Contexts/AppDbContext.cs  # DbContext + seed categorias do sistema
    └── Security/ClaimsPrincipalExtensions.cs
```

### Fluxo de Autenticação (Google OAuth)

1. Frontend recebe `idToken` do Google Identity Services
2. Envia `POST /api/auth/google { idToken }`
3. Backend valida via `GoogleTokenValidator` (Google.Apis.Auth)
4. Cria/localiza usuário por email
5. Retorna JWT (8h de validade) com claims: `sub`, `email`, `name`, `picture`, `profile_completed`

### Aviso: Build no Windows

`dotnet build` funciona normalmente. Para Docker, usar Docker Desktop (build multi-stage Linux).

### Entidades e enums

**TransactionType**: `Income`, `Expense`  
**AccountType**: `Checking`, `Savings`, `Investment`, `Cash`, `CreditCard`, `Other`  
**PaymentMethod**: `Cash`, `DebitCard`, `CreditCard`, `BankTransfer`, `Pix`, `Boleto`, `Other`  
**RecurrenceType**: `Daily`, `Weekly`, `Biweekly`, `Monthly`, `Quarterly`, `Yearly`  
**GoalType**: `FirstMillion`, `Retirement`, `EmergencyFund`, `RealEstate`, `Travel`, `Education`, `Vehicle`, `Custom`  
**RiskProfile**: `Conservative`, `Moderate`, `Aggressive`

### Seed de categorias do sistema

O `AppDbContext.SeedSystemCategories()` popula 32 categorias pré-definidas (IDs 1–32):
- **Despesas** (IDs 1–25): Moradia, Alimentação, Transporte, Saúde, Educação, Lazer, Compras, Financeiro, Assinaturas, Cuidados Pessoais + subcategorias
- **Receitas** (IDs 26–32): Salário, Freela, Rendimentos, Aluguel Recebido, Negócios, Presente, Outros

Usuários podem criar categorias customizadas (`IsSystem = false`) vinculadas ao seu `UserId`.

### InvestmentProjectionService

Calcula projeções por juros compostos mensais:
- `ProjectGoal()`: itera mês a mês até atingir `TargetAmount` ou 600 meses
- `GetSuggestions()`: retorna carteira sugerida por perfil de risco com alocações % e retornos esperados

---

## Frontend (Angular 19)

### Comandos

```bash
cd MyFirstMillionSPA/my-first-million

# Dev
npx ng serve

# Build produção
npx ng build --configuration production
# Output: dist/my-first-million/browser/

# Testes
npx ng test
```

### Estrutura

```
src/app/
├── core/
│   ├── auth/
│   │   ├── auth.service.ts       # Signal-based; JWT decode; Google login; token storage
│   │   └── auth.interceptor.ts   # Adiciona Bearer token; logout no 401
│   ├── guards/auth.guard.ts       # authGuard + profileCompleteGuard
│   ├── models/                    # Interfaces TypeScript (user, transaction, account, goal)
│   └── services/                  # transaction.service, account.service, goal.service
├── features/
│   ├── landing/                   # Página pública de apresentação
│   ├── login/                     # E-mail + Google OAuth
│   ├── complete-profile/          # Pós-login: moeda + perfil de risco
│   ├── dashboard/                 # Resumo mensal + metas + contas
│   ├── transactions/              # Lista + criação de transações com filtros
│   ├── accounts/                  # CRUD de contas com patrimônio total
│   ├── goals/                     # Metas financeiras + projeções + sugestões
│   ├── reports/                   # Relatórios por período, categorias, fluxo mensal
│   └── profile/                   # Perfil + perfil de risco
└── layout/
    ├── main-layout/               # Shell autenticado (sidebar + topbar + router-outlet)
    ├── sidebar/                   # Navegação lateral (fundo #0F172A)
    └── topbar/                    # Cabeçalho com menu do usuário
```

### Roteamento

```
/                  → LandingComponent (pública)
/login             → LoginComponent (pública)
/complete-profile  → CompleteProfileComponent (authGuard)
/app               → MainLayoutComponent (profileCompleteGuard)
  /app/dashboard   → DashboardComponent
  /app/transactions → TransactionsComponent
  /app/accounts    → AccountsComponent
  /app/goals       → GoalsComponent
  /app/reports     → ReportsComponent
  /app/profile     → ProfileComponent
**                 → /login
```

### AuthService (signals)

```typescript
auth.token()           // string | null
auth.user()            // AuthTokenPayload | null
auth.isLoggedIn()      // computed signal
auth.isProfileCompleted() // computed signal
auth.setToken(token)   // persiste no localStorage
auth.logout()          // limpa estado + redireciona /login
```

### Variáveis CSS

```css
--primary: #10B981
--sidebar-bg: #0F172A
--bg-main: #F1F5F9
--surface: #FFFFFF
--border: #E2E8F0
--text-primary: #0F172A
--text-secondary: #64748B
```

---

## Deploy

### Pré-requisitos

- Docker Desktop instalado e logado no Docker Hub
- SSH alias `Lightsail` configurado em `~/.ssh/config`
- Arquivo `.env.deploy` (baseado em `.env.deploy.example`)

### API (Docker → Lightsail)

```bash
source .env.deploy
./deploy.sh api
```

A API roda na porta `8081` no Lightsail (diferente do MyPetUniverse que usa `8080`).

### Frontend (Angular → Nginx)

```bash
./deploy.sh frontend
```

Arquivos enviados para `/var/www/myfirstmillion` no servidor.

### Configuração Nginx necessária

```nginx
server {
    listen 443 ssl;
    server_name www.myfirstmillion.com.br myfirstmillion.com.br;
    root /var/www/myfirstmillion;
    index index.html;

    location /api {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Roadmap de Evolução LLM

A integração com LLM está preparada (pacote `OpenAI 2.8.0` incluído). Próximos passos:

1. `GET /api/goals/ai-suggestions` — usar GPT-4o para análise personalizada
2. `POST /api/transactions/categorize` — auto-categorização de descrições
3. `GET /api/reports/ai-insight` — insights mensais em linguagem natural
4. Chatbot financeiro integrado ao frontend

---

## GitHub

Repositório: https://github.com/ralphneto/MyFirstMillion

Convenção de commits:
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `refactor:` refatoração
- `docs:` documentação
- `deploy:` mudanças de infraestrutura
