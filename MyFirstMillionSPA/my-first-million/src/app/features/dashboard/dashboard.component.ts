import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { GoalService } from '../../core/services/goal.service';
import { AccountService } from '../../core/services/account.service';
import { AuthService } from '../../core/auth/auth.service';
import { TransactionSummary } from '../../core/models/transaction.model';
import { FinancialGoal } from '../../core/models/goal.model';
import { Account } from '../../core/models/account.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, PercentPipe, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <div>
          <h1>Olá, {{ auth.user()?.name?.split(' ')[0] }}! 👋</h1>
          <p class="subtitle">Aqui está o resumo do seu mês</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/app/transactions">
          <mat-icon>add</mat-icon>
          Nova Transação
        </a>
      </div>

      <!-- Summary cards -->
      <div class="cards-grid">
        <div class="summary-card income">
          <div class="card-header">
            <span class="card-label">Receitas</span>
            <mat-icon>trending_up</mat-icon>
          </div>
          <div class="card-value">{{ summary?.totalIncome | currency:'BRL':'symbol':'1.2-2' }}</div>
          <div class="card-sub">este mês</div>
        </div>

        <div class="summary-card expense">
          <div class="card-header">
            <span class="card-label">Despesas</span>
            <mat-icon>trending_down</mat-icon>
          </div>
          <div class="card-value">{{ summary?.totalExpenses | currency:'BRL':'symbol':'1.2-2' }}</div>
          <div class="card-sub">este mês</div>
        </div>

        <div class="summary-card balance">
          <div class="card-header">
            <span class="card-label">Saldo</span>
            <mat-icon>account_balance_wallet</mat-icon>
          </div>
          <div class="card-value" [class.negative]="(summary?.balance ?? 0) < 0">
            {{ summary?.balance | currency:'BRL':'symbol':'1.2-2' }}
          </div>
          <div class="card-sub">
            Taxa de poupança: {{ (summary?.savingsRate ?? 0) / 100 | percent:'1.1-1' }}
          </div>
        </div>

        <div class="summary-card networth">
          <div class="card-header">
            <span class="card-label">Patrimônio Total</span>
            <mat-icon>account_balance</mat-icon>
          </div>
          <div class="card-value">{{ totalNetWorth | currency:'BRL':'symbol':'1.2-2' }}</div>
          <div class="card-sub">{{ accounts.length }} conta(s)</div>
        </div>
      </div>

      <div class="content-grid">
        <!-- Expense breakdown -->
        <div class="panel">
          <h3>Top Despesas por Categoria</h3>
          @if (summary?.topExpenseCategories?.length) {
            @for (cat of summary!.topExpenseCategories; track cat.categoryId) {
              <div class="category-row">
                <div class="cat-info">
                  <mat-icon [style.color]="cat.categoryColor">{{ cat.categoryIcon }}</mat-icon>
                  <span>{{ cat.categoryName }}</span>
                </div>
                <div class="cat-right">
                  <span class="cat-amount">{{ cat.amount | currency:'BRL':'symbol':'1.2-2' }}</span>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="cat.percentage" [style.background]="cat.categoryColor"></div>
                  </div>
                </div>
              </div>
            }
          } @else {
            <div class="empty-state">
              <mat-icon>bar_chart</mat-icon>
              <p>Nenhuma despesa registrada este mês.</p>
              <a mat-stroked-button routerLink="/app/transactions">Adicionar transação</a>
            </div>
          }
        </div>

        <!-- Goals overview -->
        <div class="panel">
          <div class="panel-header">
            <h3>Metas Financeiras</h3>
            <a mat-button routerLink="/app/goals">Ver todas</a>
          </div>
          @if (goals.length) {
            @for (goal of goals.slice(0, 3); track goal.id) {
              <div class="goal-row">
                <div class="goal-info">
                  <mat-icon [style.color]="goal.color">{{ goal.icon }}</mat-icon>
                  <div>
                    <div class="goal-name">{{ goal.name }}</div>
                    <div class="goal-amount">
                      {{ goal.currentAmount | currency:'BRL':'symbol':'1.2-2' }} /
                      {{ goal.targetAmount | currency:'BRL':'symbol':'1.2-2' }}
                    </div>
                  </div>
                </div>
                <div class="goal-progress">
                  <span class="progress-pct">{{ goal.progressPercent | number:'1.0-0' }}%</span>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="goal.progressPercent" [style.background]="goal.color"></div>
                  </div>
                </div>
              </div>
            }
          } @else {
            <div class="empty-state">
              <mat-icon>emoji_events</mat-icon>
              <p>Defina sua meta do Primeiro Milhão!</p>
              <a mat-flat-button color="primary" routerLink="/app/goals">Criar meta</a>
            </div>
          }
        </div>
      </div>

      <!-- Accounts -->
      <div class="panel accounts-panel">
        <div class="panel-header">
          <h3>Suas Contas</h3>
          <a mat-button routerLink="/app/accounts">Gerenciar</a>
        </div>
        <div class="accounts-grid">
          @for (account of accounts; track account.id) {
            <div class="account-card" [style.border-top-color]="account.color">
              <div class="account-header">
                <mat-icon [style.color]="account.color">{{ account.icon }}</mat-icon>
                <span class="account-type">{{ accountTypeLabel(account.type) }}</span>
              </div>
              <div class="account-name">{{ account.name }}</div>
              <div class="account-balance" [class.negative]="account.balance < 0">
                {{ account.balance | currency:'BRL':'symbol':'1.2-2' }}
              </div>
            </div>
          }
          @if (!accounts.length) {
            <div class="empty-state" style="grid-column: 1/-1">
              <mat-icon>account_balance_wallet</mat-icon>
              <p>Adicione uma conta para começar.</p>
              <a mat-flat-button color="primary" routerLink="/app/accounts">Adicionar conta</a>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; }
    .subtitle { color: var(--text-secondary); margin: 0; }

    .cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .summary-card {
      background: var(--surface); border-radius: 16px; padding: 20px;
      border-left: 4px solid transparent;
    }
    .summary-card.income { border-left-color: #10B981; }
    .summary-card.expense { border-left-color: #EF4444; }
    .summary-card.balance { border-left-color: #6366F1; }
    .summary-card.networth { border-left-color: #F59E0B; }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .card-label { font-size: 13px; color: var(--text-secondary); font-weight: 500; }
    .summary-card.income mat-icon { color: #10B981; }
    .summary-card.expense mat-icon { color: #EF4444; }
    .summary-card.balance mat-icon { color: #6366F1; }
    .summary-card.networth mat-icon { color: #F59E0B; }
    .card-value { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .card-value.negative { color: #EF4444; }
    .card-sub { font-size: 12px; color: var(--text-secondary); }

    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .panel { background: var(--surface); border-radius: 16px; padding: 24px; }
    .panel h3 { font-size: 16px; font-weight: 600; margin: 0 0 20px; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .panel-header h3 { margin: 0; }

    .category-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .category-row:last-child { border: none; }
    .cat-info { display: flex; align-items: center; gap: 10px; font-size: 14px; }
    .cat-info mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .cat-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 140px; }
    .cat-amount { font-size: 14px; font-weight: 600; }
    .progress-bar { width: 120px; height: 6px; background: var(--bg-main); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }

    .goal-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border); }
    .goal-row:last-child { border: none; }
    .goal-info { display: flex; align-items: center; gap: 10px; }
    .goal-info mat-icon { font-size: 24px; width: 24px; height: 24px; }
    .goal-name { font-size: 14px; font-weight: 500; }
    .goal-amount { font-size: 12px; color: var(--text-secondary); }
    .goal-progress { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 100px; }
    .progress-pct { font-size: 13px; font-weight: 600; }

    .accounts-panel { margin-top: 0; }
    .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .account-card { background: var(--bg-main); border-radius: 12px; padding: 16px; border-top: 3px solid; }
    .account-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .account-type { font-size: 12px; color: var(--text-secondary); }
    .account-name { font-size: 15px; font-weight: 500; margin-bottom: 4px; }
    .account-balance { font-size: 20px; font-weight: 700; }
    .account-balance.negative { color: #EF4444; }

    .empty-state { text-align: center; padding: 32px; color: var(--text-secondary); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.4; margin-bottom: 8px; display: block; }
    .empty-state p { margin: 0 0 16px; }

    @media (max-width: 1024px) {
      .cards-grid { grid-template-columns: repeat(2, 1fr); }
      .content-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .cards-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private transactionSvc = inject(TransactionService);
  private goalSvc = inject(GoalService);
  private accountSvc = inject(AccountService);

  summary: TransactionSummary | null = null;
  goals: FinancialGoal[] = [];
  accounts: Account[] = [];
  totalNetWorth = 0;

  ngOnInit() {
    const now = new Date();
    this.transactionSvc.getSummary(now.getFullYear(), now.getMonth() + 1).subscribe(s => this.summary = s);
    this.goalSvc.getAll().subscribe(g => this.goals = g);
    this.accountSvc.getAll().subscribe(accounts => {
      this.accounts = accounts;
      this.totalNetWorth = accounts.filter(a => a.includeInTotal).reduce((sum, a) => sum + a.balance, 0);
    });
  }

  accountTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      Checking: 'Conta Corrente', Savings: 'Poupança',
      Investment: 'Investimento', Cash: 'Dinheiro',
      CreditCard: 'Cartão de Crédito', Other: 'Outro'
    };
    return labels[type] ?? type;
  }
}
