import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AccountService } from '../../core/services/account.service';
import { Account, AccountType } from '../../core/models/account.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="accounts-page">
      <div class="page-header">
        <div>
          <h1>Contas</h1>
          <p class="subtitle">Gerencie suas contas e carteiras</p>
        </div>
        <button mat-flat-button color="primary" (click)="showForm = !showForm">
          <mat-icon>{{ showForm ? 'close' : 'add' }}</mat-icon>
          {{ showForm ? 'Fechar' : 'Nova Conta' }}
        </button>
      </div>

      @if (showForm) {
        <div class="panel form-panel">
          <h3>Nova Conta</h3>
          <div class="form-grid">
            <input class="input" placeholder="Nome da conta" [(ngModel)]="form.name" />
            <select class="input" [(ngModel)]="form.type">
              <option value="Checking">Conta Corrente</option>
              <option value="Savings">Poupança</option>
              <option value="Investment">Investimento</option>
              <option value="Cash">Dinheiro em Espécie</option>
              <option value="CreditCard">Cartão de Crédito</option>
              <option value="Other">Outro</option>
            </select>
            <input class="input" type="number" placeholder="Saldo inicial (R$)" [(ngModel)]="form.initialBalance" />
            <input class="input" placeholder="Nome do banco" [(ngModel)]="form.bankName" />
            <input class="input" type="color" [(ngModel)]="form.color" style="height: 46px; cursor: pointer;" />
          </div>
          <div class="form-actions">
            <button mat-button (click)="showForm = false">Cancelar</button>
            <button mat-flat-button color="primary" (click)="save()">Criar Conta</button>
          </div>
        </div>
      }

      <div class="net-worth panel">
        <div class="nw-label">Patrimônio Total</div>
        <div class="nw-value" [class.negative]="netWorth < 0">
          {{ netWorth | currency:'BRL':'symbol':'1.2-2' }}
        </div>
        <div class="nw-sub">{{ accounts.length }} conta(s) ativas</div>
      </div>

      <div class="accounts-grid">
        @for (account of accounts; track account.id) {
          <div class="account-card" [style.border-top-color]="account.color">
            <div class="account-header">
              <mat-icon [style.color]="account.color">{{ account.icon }}</mat-icon>
              <div class="account-actions">
                <button mat-icon-button (click)="deleteAccount(account.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
            <div class="account-name">{{ account.name }}</div>
            @if (account.bankName) { <div class="account-bank">{{ account.bankName }}</div> }
            <div class="account-type-label">{{ typeLabel(account.type) }}</div>
            <div class="account-balance" [class.negative]="account.balance < 0">
              {{ account.balance | currency:'BRL':'symbol':'1.2-2' }}
            </div>
            @if (!account.includeInTotal) {
              <span class="badge">Não incluso no total</span>
            }
          </div>
        }
      </div>

      @if (!accounts.length && !showForm) {
        <div class="empty-state panel">
          <mat-icon>account_balance_wallet</mat-icon>
          <h3>Nenhuma conta cadastrada</h3>
          <p>Adicione suas contas para começar a controlar seu patrimônio.</p>
          <button mat-flat-button color="primary" (click)="showForm = true">Adicionar primeira conta</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .accounts-page { display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; }
    .subtitle { color: var(--text-secondary); margin: 0; }
    .panel { background: var(--surface); border-radius: 16px; padding: 24px; }
    .form-panel h3 { margin: 0 0 16px; }
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .input { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-main); color: var(--text-primary); font-size: 14px; font-family: inherit; width: 100%; box-sizing: border-box; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 16px; }

    .net-worth { text-align: center; }
    .nw-label { color: var(--text-secondary); font-size: 14px; margin-bottom: 8px; }
    .nw-value { font-size: 40px; font-weight: 700; color: #10B981; }
    .nw-value.negative { color: #EF4444; }
    .nw-sub { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }

    .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .account-card { background: var(--surface); border-radius: 16px; padding: 20px; border-top: 4px solid; }
    .account-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .account-header mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .account-actions button { color: var(--text-secondary); }
    .account-name { font-size: 18px; font-weight: 600; margin-bottom: 2px; }
    .account-bank { font-size: 13px; color: var(--text-secondary); margin-bottom: 2px; }
    .account-type-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .account-balance { font-size: 28px; font-weight: 700; }
    .account-balance.negative { color: #EF4444; }
    .badge { font-size: 11px; background: var(--bg-main); padding: 2px 8px; border-radius: 4px; color: var(--text-secondary); }

    .empty-state { text-align: center; padding: 60px 24px; }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; color: var(--primary); opacity: 0.4; display: block; margin: 0 auto 16px; }
    .empty-state h3 { font-size: 18px; margin-bottom: 8px; }
    .empty-state p { color: var(--text-secondary); margin-bottom: 24px; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; gap: 12px; }
    }
  `]
})
export class AccountsComponent implements OnInit {
  private accountSvc = inject(AccountService);

  accounts: Account[] = [];
  netWorth = 0;
  showForm = false;
  form = { name: '', type: 'Checking' as AccountType, initialBalance: 0, bankName: '', color: '#6366F1', icon: 'account_balance', currency: 'BRL', includeInTotal: true };

  ngOnInit() { this.load(); }

  load() {
    this.accountSvc.getAll().subscribe(accounts => {
      this.accounts = accounts;
      this.netWorth = accounts.filter(a => a.includeInTotal).reduce((s, a) => s + a.balance, 0);
    });
  }

  save() {
    this.accountSvc.create(this.form as any).subscribe(() => {
      this.showForm = false;
      this.load();
    });
  }

  deleteAccount(id: number) {
    if (confirm('Deseja desativar esta conta?')) {
      this.accountSvc.delete(id).subscribe(() => this.load());
    }
  }

  typeLabel(t: string) {
    return ({ Checking: 'Conta Corrente', Savings: 'Poupança', Investment: 'Investimento', Cash: 'Dinheiro', CreditCard: 'Cartão de Crédito', Other: 'Outro' } as any)[t] ?? t;
  }
}
