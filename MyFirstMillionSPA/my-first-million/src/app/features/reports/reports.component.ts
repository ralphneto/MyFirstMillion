import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransactionService } from '../../core/services/transaction.service';
import { TransactionSummary, MonthlyFlow } from '../../core/models/transaction.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="reports-page">
      <div class="page-header">
        <div>
          <h1>Relatórios</h1>
          <p class="subtitle">Análise detalhada das suas finanças</p>
        </div>
        <div class="filters">
          <select class="input" [(ngModel)]="year" (change)="load()">
            @for (y of years; track y) { <option [value]="y">{{ y }}</option> }
          </select>
          <select class="input" [(ngModel)]="month" (change)="load()">
            @for (m of months; track m.value) { <option [value]="m.value">{{ m.label }}</option> }
          </select>
        </div>
      </div>

      @if (summary) {
        <div class="kpi-row">
          <div class="kpi income">
            <mat-icon>trending_up</mat-icon>
            <div class="kpi-value">{{ summary.totalIncome | currency:'BRL':'symbol':'1.2-2' }}</div>
            <div class="kpi-label">Receita Total</div>
          </div>
          <div class="kpi expense">
            <mat-icon>trending_down</mat-icon>
            <div class="kpi-value">{{ summary.totalExpenses | currency:'BRL':'symbol':'1.2-2' }}</div>
            <div class="kpi-label">Despesa Total</div>
          </div>
          <div class="kpi balance">
            <mat-icon>savings</mat-icon>
            <div class="kpi-value" [class.negative]="summary.balance < 0">
              {{ summary.balance | currency:'BRL':'symbol':'1.2-2' }}
            </div>
            <div class="kpi-label">Saldo</div>
          </div>
          <div class="kpi savings">
            <mat-icon>percent</mat-icon>
            <div class="kpi-value">{{ summary.savingsRate | number:'1.1-1' }}%</div>
            <div class="kpi-label">Taxa de Poupança</div>
          </div>
        </div>

        <div class="content-grid">
          <div class="panel">
            <h3>Despesas por Categoria</h3>
            @for (cat of summary.topExpenseCategories; track cat.categoryId) {
              <div class="cat-row">
                <div class="cat-icon" [style.color]="cat.categoryColor">
                  <mat-icon>{{ cat.categoryIcon }}</mat-icon>
                </div>
                <div class="cat-info">
                  <div class="cat-name">{{ cat.categoryName }}</div>
                  <div class="cat-bar">
                    <div class="cat-fill" [style.width.%]="cat.percentage" [style.background]="cat.categoryColor"></div>
                  </div>
                </div>
                <div class="cat-right">
                  <div class="cat-amount">{{ cat.amount | currency:'BRL':'symbol':'1.2-2' }}</div>
                  <div class="cat-pct">{{ cat.percentage | number:'1.0-0' }}%</div>
                </div>
              </div>
            }
          </div>

          <div class="panel">
            <h3>Receitas por Categoria</h3>
            @for (cat of summary.topIncomeCategories; track cat.categoryId) {
              <div class="cat-row">
                <div class="cat-icon" [style.color]="cat.categoryColor">
                  <mat-icon>{{ cat.categoryIcon }}</mat-icon>
                </div>
                <div class="cat-info">
                  <div class="cat-name">{{ cat.categoryName }}</div>
                  <div class="cat-bar">
                    <div class="cat-fill" [style.width.%]="cat.percentage" [style.background]="cat.categoryColor"></div>
                  </div>
                </div>
                <div class="cat-right">
                  <div class="cat-amount">{{ cat.amount | currency:'BRL':'symbol':'1.2-2' }}</div>
                  <div class="cat-pct">{{ cat.percentage | number:'1.0-0' }}%</div>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="panel">
          <h3>Fluxo Mensal (últimos 12 meses)</h3>
          <div class="monthly-table">
            <div class="table-header">
              <span>Mês</span>
              <span>Receita</span>
              <span>Despesa</span>
              <span>Saldo</span>
            </div>
            @for (flow of summary.monthlyFlow.slice(-12); track flow.label) {
              <div class="table-row">
                <span>{{ flow.label }}</span>
                <span class="income">{{ flow.income | currency:'BRL':'symbol':'1.2-2' }}</span>
                <span class="expense">{{ flow.expenses | currency:'BRL':'symbol':'1.2-2' }}</span>
                <span [class.income]="flow.balance >= 0" [class.expense]="flow.balance < 0">
                  {{ flow.balance | currency:'BRL':'symbol':'1.2-2' }}
                </span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .reports-page { display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; }
    .subtitle { color: var(--text-secondary); margin: 0; }
    .filters { display: flex; gap: 12px; }
    .input { padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary); font-size: 14px; font-family: inherit; }

    .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .kpi { background: var(--surface); border-radius: 16px; padding: 24px; text-align: center; }
    .kpi mat-icon { font-size: 36px; width: 36px; height: 36px; margin-bottom: 8px; }
    .kpi.income mat-icon { color: #10B981; }
    .kpi.expense mat-icon { color: #EF4444; }
    .kpi.balance mat-icon { color: #6366F1; }
    .kpi.savings mat-icon { color: #F59E0B; }
    .kpi-value { font-size: 22px; font-weight: 700; }
    .kpi-value.negative { color: #EF4444; }
    .kpi-label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }

    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .panel { background: var(--surface); border-radius: 16px; padding: 24px; }
    .panel h3 { font-size: 16px; font-weight: 600; margin: 0 0 20px; }

    .cat-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .cat-row:last-child { border: none; }
    .cat-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .cat-info { flex: 1; }
    .cat-name { font-size: 14px; margin-bottom: 4px; }
    .cat-bar { height: 6px; background: var(--bg-main); border-radius: 3px; overflow: hidden; }
    .cat-fill { height: 100%; border-radius: 3px; }
    .cat-right { text-align: right; min-width: 120px; }
    .cat-amount { font-size: 14px; font-weight: 600; }
    .cat-pct { font-size: 12px; color: var(--text-secondary); }

    .monthly-table { overflow-x: auto; }
    .table-header, .table-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; padding: 10px 0; }
    .table-header { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid var(--border); font-weight: 600; }
    .table-row { border-bottom: 1px solid var(--border); font-size: 14px; }
    .table-row:last-child { border: none; }
    .income { color: #10B981; }
    .expense { color: #EF4444; }

    @media (max-width: 1024px) {
      .kpi-row { grid-template-columns: repeat(2, 1fr); }
      .content-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .kpi-row { grid-template-columns: 1fr; }
    }
  `]
})
export class ReportsComponent implements OnInit {
  private txSvc = inject(TransactionService);

  summary: TransactionSummary | null = null;
  year = new Date().getFullYear();
  month = new Date().getMonth() + 1;
  years = [new Date().getFullYear(), new Date().getFullYear() - 1];
  months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
  ];

  ngOnInit() { this.load(); }
  load() { this.txSvc.getSummary(this.year, this.month).subscribe(s => this.summary = s); }
}
