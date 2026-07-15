import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { CharacterPopupService } from '../../core/services/character-popup.service';
import { Transaction, TransactionType, PaymentMethod } from '../../core/models/transaction.model';
import { Account } from '../../core/models/account.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface CategoryOption { id: number; name: string; icon: string; color: string; type: string; }

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, MatIconModule, MatButtonModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatChipsModule],
  template: `
    <div class="transactions-page">
      <div class="page-header">
        <div>
          <h1>Transações</h1>
          <p class="subtitle">Gerencie suas receitas e despesas</p>
        </div>
        <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
          <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
          {{ showForm() ? 'Fechar' : 'Nova Transação' }}
        </button>
      </div>

      @if (showForm()) {
        <div class="form-panel panel">
          <h3>Nova Transação</h3>
          <div class="type-toggle">
            <button [class.active]="form.type === 'Expense'" (click)="form.type = 'Expense'">
              <mat-icon>trending_down</mat-icon> Despesa
            </button>
            <button [class.active]="form.type === 'Income'" (click)="form.type = 'Income'">
              <mat-icon>trending_up</mat-icon> Receita
            </button>
          </div>
          <div class="form-grid">
            <input class="input" type="number" placeholder="Valor (R$)" [(ngModel)]="form.amount" />
            <input class="input" type="date" [(ngModel)]="form.date" />
            <input class="input" placeholder="Descrição" [(ngModel)]="form.description" />
            <select class="input" [(ngModel)]="form.accountId">
              <option [value]="0">Selecione a conta</option>
              @for (a of accounts; track a.id) {
                <option [value]="a.id">{{ a.name }}</option>
              }
            </select>
            <select class="input" [(ngModel)]="form.categoryId">
              <option [value]="0">Selecione a categoria</option>
              @for (c of filteredCategories; track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
            <select class="input" [(ngModel)]="form.paymentMethod">
              <option value="Pix">Pix</option>
              <option value="DebitCard">Cartão de Débito</option>
              <option value="CreditCard">Cartão de Crédito</option>
              <option value="Cash">Dinheiro</option>
              <option value="BankTransfer">Transferência</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>
          <input class="input" placeholder="Observações (opcional)" [(ngModel)]="form.notes" style="margin-top: 12px; width:100%; box-sizing:border-box" />
          <div class="form-actions">
            <button mat-button (click)="showForm.set(false)">Cancelar</button>
            <button mat-flat-button color="primary" (click)="save()">Salvar Transação</button>
          </div>
        </div>
      }

      <!-- Filters -->
      <div class="filters panel">
        <select class="input filter-input" [(ngModel)]="filterYear" (change)="load()">
          @for (y of years; track y) { <option [value]="y">{{ y }}</option> }
        </select>
        <select class="input filter-input" [(ngModel)]="filterMonth" (change)="load()">
          @for (m of months; track m.value) { <option [value]="m.value">{{ m.label }}</option> }
        </select>
        <select class="input filter-input" [(ngModel)]="filterType" (change)="load()">
          <option value="">Todos</option>
          <option value="Income">Receitas</option>
          <option value="Expense">Despesas</option>
        </select>
      </div>

      <!-- Transactions list -->
      <div class="panel">
        <div class="list-header">
          <span>{{ total }} transações</span>
        </div>
        @for (tx of transactions; track tx.id) {
          <div class="tx-row">
            <div class="tx-icon" [style.background]="tx.categoryColor + '22'" [style.color]="tx.categoryColor">
              <mat-icon>{{ tx.categoryIcon }}</mat-icon>
            </div>
            <div class="tx-info">
              <div class="tx-desc">{{ tx.description }}</div>
              <div class="tx-meta">{{ tx.categoryName }} · {{ tx.date | date:'dd/MM/yyyy' }}</div>
            </div>
            <div class="tx-right">
              <div class="tx-amount" [class.income]="tx.type === 'Income'" [class.expense]="tx.type === 'Expense'">
                {{ tx.type === 'Income' ? '+' : '-' }} {{ tx.amount | currency:'BRL':'symbol':'1.2-2' }}
              </div>
              <div class="tx-account">{{ tx.accountName }}</div>
            </div>
            <button mat-icon-button (click)="delete(tx.id)" class="delete-btn">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        } @empty {
          <div class="empty-state">
            <mat-icon>receipt_long</mat-icon>
            <p>Nenhuma transação encontrada para este período.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .transactions-page { display: flex; flex-direction: column; gap: 20px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; }
    .subtitle { color: var(--text-secondary); margin: 0; }

    .panel { background: var(--surface); border-radius: 16px; padding: 20px; }
    .form-panel h3 { margin: 0 0 16px; }
    .type-toggle { display: flex; gap: 0; margin-bottom: 16px; border-radius: 8px; overflow: hidden; border: 1px solid var(--border); width: fit-content; }
    .type-toggle button { padding: 10px 20px; border: none; background: transparent; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 14px; font-family: inherit; color: var(--text-secondary); }
    .type-toggle button.active { background: var(--primary); color: white; }
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .input { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-main); color: var(--text-primary); font-size: 14px; font-family: inherit; width: 100%; box-sizing: border-box; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }

    .filters { display: flex; gap: 12px; flex-wrap: wrap; }
    .filter-input { width: auto; min-width: 140px; }

    .list-header { padding-bottom: 12px; border-bottom: 1px solid var(--border); color: var(--text-secondary); font-size: 13px; }
    .tx-row { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border); }
    .tx-row:last-child { border: none; }
    .tx-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .tx-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .tx-info { flex: 1; }
    .tx-desc { font-size: 14px; font-weight: 500; }
    .tx-meta { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
    .tx-right { text-align: right; }
    .tx-amount { font-size: 15px; font-weight: 600; }
    .tx-amount.income { color: #10B981; }
    .tx-amount.expense { color: #EF4444; }
    .tx-account { font-size: 12px; color: var(--text-secondary); }
    .delete-btn { color: var(--text-secondary); opacity: 0; transition: opacity 0.15s; }
    .tx-row:hover .delete-btn { opacity: 1; }

    .empty-state { text-align: center; padding: 48px; color: var(--text-secondary); }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.3; display: block; margin: 0 auto 12px; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 12px; }
    }
  `]
})
export class TransactionsComponent implements OnInit {
  private txSvc = inject(TransactionService);
  private accountSvc = inject(AccountService);
  private characterPopup = inject(CharacterPopupService);
  private http = inject(HttpClient);

  transactions: Transaction[] = [];
  accounts: Account[] = [];
  categories: CategoryOption[] = [];
  total = 0;
  showForm = signal(false);

  filterYear = new Date().getFullYear();
  filterMonth = new Date().getMonth() + 1;
  filterType = '';

  form = {
    type: 'Expense' as TransactionType,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    accountId: 0,
    categoryId: 0,
    paymentMethod: 'Pix' as PaymentMethod,
    notes: ''
  };

  years = [new Date().getFullYear(), new Date().getFullYear() - 1];
  months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
  ];

  get filteredCategories() {
    return this.categories.filter(c => c.type === this.form.type);
  }

  ngOnInit() {
    this.load();
    this.accountSvc.getAll().subscribe(a => this.accounts = a);
    this.http.get<any[]>(`${environment.apiUrl}/categories`).subscribe(cats => {
      this.categories = [];
      cats.forEach(c => {
        this.categories.push({ id: c.id, name: c.name, icon: c.icon, color: c.color, type: c.type });
        c.subCategories?.forEach((s: any) => this.categories.push({ id: s.id, name: `  ${s.name}`, icon: s.icon, color: s.color, type: s.type }));
      });
    });
  }

  load() {
    this.txSvc.getAll({ year: this.filterYear, month: this.filterMonth, type: this.filterType || undefined })
      .subscribe(r => { this.transactions = r.items; this.total = r.total; });
  }

  save() {
    const { type, amount } = this.form;
    this.txSvc.create({
      accountId: this.form.accountId,
      categoryId: this.form.categoryId,
      amount,
      type,
      date: this.form.date,
      description: this.form.description,
      notes: this.form.notes,
      paymentMethod: this.form.paymentMethod
    }).subscribe(() => {
      this.showForm.set(false);
      this.load();
      this.characterPopup.triggerForTransaction(type, amount);
    });
  }

  delete(id: number) {
    if (confirm('Deseja excluir esta transação?')) {
      this.txSvc.delete(id).subscribe(() => this.load());
    }
  }
}
