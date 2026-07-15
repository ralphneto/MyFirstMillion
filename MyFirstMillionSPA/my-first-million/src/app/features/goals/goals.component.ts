import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GoalService } from '../../core/services/goal.service';
import { CharacterPopupService } from '../../core/services/character-popup.service';
import { FinancialGoal, InvestmentSuggestions } from '../../core/models/goal.model';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, DatePipe, FormsModule, MatIconModule, MatButtonModule, MatDialogModule, MatProgressBarModule],
  template: `
    <div class="goals-page">
      <div class="page-header">
        <div>
          <h1>Metas Financeiras</h1>
          <p class="subtitle">Acompanhe seu progresso rumo ao primeiro milhão</p>
        </div>
        <button mat-flat-button color="primary" (click)="showCreateForm = true">
          <mat-icon>add</mat-icon> Nova Meta
        </button>
      </div>

      @if (showCreateForm) {
        <div class="create-form panel">
          <h3>Nova Meta</h3>
          <div class="form-grid">
            <input class="input" placeholder="Nome da meta" [(ngModel)]="newGoal.name" />
            <input class="input" type="number" placeholder="Valor alvo (R$)" [(ngModel)]="newGoal.targetAmount" />
            <input class="input" type="number" placeholder="Valor inicial (R$)" [(ngModel)]="newGoal.initialAmount" />
            <input class="input" type="number" placeholder="Aporte mensal (R$)" [(ngModel)]="newGoal.monthlyContribution" />
            <input class="input" type="number" placeholder="Retorno anual esperado (%)" [(ngModel)]="newGoal.expectedReturnRate" />
            <input class="input" type="date" [(ngModel)]="newGoal.targetDate" />
          </div>
          <div class="form-actions">
            <button mat-button (click)="showCreateForm = false">Cancelar</button>
            <button mat-flat-button color="primary" (click)="createGoal()">Criar Meta</button>
          </div>
        </div>
      }

      <div class="goals-grid">
        @for (goal of goals; track goal.id) {
          <div class="goal-card" [style.border-top-color]="goal.color">
            <div class="goal-card-header">
              <mat-icon [style.color]="goal.color">{{ goal.icon }}</mat-icon>
              <div class="goal-meta">
                <h3>{{ goal.name }}</h3>
                @if (goal.isAchieved) { <span class="badge achieved">Conquistada!</span> }
              </div>
            </div>

            <div class="goal-amounts">
              <div class="current">{{ goal.currentAmount | currency:'BRL':'symbol':'1.2-2' }}</div>
              <div class="separator">/</div>
              <div class="target">{{ goal.targetAmount | currency:'BRL':'symbol':'1.2-2' }}</div>
            </div>

            <mat-progress-bar mode="determinate" [value]="goal.progressPercent" [color]="goal.isAchieved ? 'accent' : 'primary'"></mat-progress-bar>
            <div class="progress-label">{{ goal.progressPercent | number:'1.1-1' }}% concluído</div>

            <div class="goal-stats">
              <div class="stat">
                <mat-icon>calendar_month</mat-icon>
                <span>Meta: {{ goal.targetDate | date:'MM/yyyy' }}</span>
              </div>
              <div class="stat">
                <mat-icon>savings</mat-icon>
                <span>{{ goal.monthlyContribution | currency:'BRL':'symbol':'1.0-0' }}/mês</span>
              </div>
            </div>

            <div class="goal-actions">
              <button mat-button (click)="showAddContribution(goal)">
                <mat-icon>add_circle</mat-icon> Aportar
              </button>
              <button mat-button (click)="loadProjection(goal)">
                <mat-icon>trending_up</mat-icon> Projeção
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Investment suggestions -->
      @if (suggestions) {
        <div class="panel suggestions-panel">
          <h3>
            <mat-icon>lightbulb</mat-icon>
            Sugestões de Investimento — Perfil {{ suggestions.profile }}
          </h3>
          <p class="suggestions-sub">Retorno anual esperado: <strong>{{ suggestions.expectedAnnualReturn }}%</strong></p>
          <div class="suggestions-grid">
            @for (s of suggestions.suggestions; track s.name) {
              <div class="suggestion-card">
                <div class="sug-header">
                  <span class="sug-name">{{ s.name }}</span>
                  <span class="sug-alloc">{{ s.allocation }}%</span>
                </div>
                <div class="sug-badges">
                  <span class="badge return">{{ s.expectedReturn }}% a.a.</span>
                  <span class="badge risk" [class.low]="s.risk.includes('Baixo')" [class.high]="s.risk.includes('Alto')">{{ s.risk }}</span>
                </div>
                <p class="sug-desc">{{ s.description }}</p>
              </div>
            }
          </div>
        </div>
      }

      @if (!goals.length && !showCreateForm) {
        <div class="empty-state">
          <mat-icon>emoji_events</mat-icon>
          <h3>Nenhuma meta cadastrada</h3>
          <p>Defina sua meta do Primeiro Milhão e veja quanto tempo levará para chegar lá!</p>
          <button mat-flat-button color="primary" (click)="showCreateForm = true">Criar minha primeira meta</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .goals-page { display: flex; flex-direction: column; gap: 24px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; }
    .subtitle { color: var(--text-secondary); margin: 0; }

    .panel { background: var(--surface); border-radius: 16px; padding: 24px; }
    .create-form .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .input { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-main); color: var(--text-primary); font-size: 14px; box-sizing: border-box; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; }

    .goals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .goal-card { background: var(--surface); border-radius: 16px; padding: 24px; border-top: 4px solid; display: flex; flex-direction: column; gap: 16px; }
    .goal-card-header { display: flex; align-items: center; gap: 12px; }
    .goal-card-header mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .goal-meta h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .goal-amounts { display: flex; align-items: baseline; gap: 8px; }
    .current { font-size: 22px; font-weight: 700; color: var(--primary); }
    .separator, .target { color: var(--text-secondary); font-size: 16px; }
    .progress-label { font-size: 12px; color: var(--text-secondary); }
    .goal-stats { display: flex; gap: 16px; }
    .stat { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--text-secondary); }
    .stat mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .goal-actions { display: flex; gap: 8px; }
    .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge.achieved { background: #D1FAE5; color: #065F46; }

    .suggestions-panel h3 { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; font-size: 18px; }
    .suggestions-panel mat-icon { color: #F59E0B; }
    .suggestions-sub { color: var(--text-secondary); margin-bottom: 20px; }
    .suggestions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .suggestion-card { background: var(--bg-main); border-radius: 12px; padding: 16px; }
    .sug-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .sug-name { font-weight: 600; font-size: 15px; }
    .sug-alloc { font-size: 20px; font-weight: 700; color: var(--primary); }
    .sug-badges { display: flex; gap: 8px; margin-bottom: 8px; }
    .badge.return { background: #D1FAE5; color: #065F46; }
    .badge.risk { background: #FEF3C7; color: #92400E; }
    .badge.risk.low { background: #D1FAE5; color: #065F46; }
    .badge.risk.high { background: #FEE2E2; color: #991B1B; }
    .sug-desc { font-size: 13px; color: var(--text-secondary); margin: 0; }

    .empty-state { text-align: center; padding: 80px 24px; background: var(--surface); border-radius: 16px; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: #F59E0B; display: block; margin: 0 auto 16px; }
    .empty-state h3 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    .empty-state p { color: var(--text-secondary); margin-bottom: 24px; }

    @media (max-width: 768px) {
      .create-form .form-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class GoalsComponent implements OnInit {
  private goalSvc = inject(GoalService);
  private characterPopup = inject(CharacterPopupService);

  goals: FinancialGoal[] = [];
  suggestions: InvestmentSuggestions | null = null;
  showCreateForm = false;
  newGoal = { name: '', targetAmount: 1000000, initialAmount: 0, monthlyContribution: 2000, expectedReturnRate: 11.5, targetDate: '' };

  ngOnInit() {
    this.loadGoals();
    this.goalSvc.getInvestmentSuggestions().subscribe(s => this.suggestions = s);
  }

  loadGoals() {
    this.goalSvc.getAll().subscribe(g => this.goals = g);
  }

  createGoal() {
    this.goalSvc.create(this.newGoal as any).subscribe(() => {
      this.showCreateForm = false;
      this.newGoal = { name: '', targetAmount: 1000000, initialAmount: 0, monthlyContribution: 2000, expectedReturnRate: 11.5, targetDate: '' };
      this.loadGoals();
    });
  }

  showAddContribution(goal: FinancialGoal) {
    const amount = parseFloat(prompt('Valor do aporte (R$):') ?? '0');
    if (amount > 0) {
      this.goalSvc.addContribution(goal.id, amount, new Date().toISOString().split('T')[0])
        .subscribe(() => {
          this.loadGoals();
          this.characterPopup.showRalphao(amount, goal.name);
        });
    }
  }

  loadProjection(goal: FinancialGoal) {
    this.goalSvc.getProjection(goal.id).subscribe(p => {
      const msg = p.estimatedCompletionDate
        ? `Meta: ${goal.name}\nProgressso: ${p.progressPercent.toFixed(1)}%\nEstimativa de conclusão: ${new Date(p.estimatedCompletionDate).toLocaleDateString('pt-BR')}\nMeses restantes: ${p.monthsToGoal}`
        : 'Projeção indisponível — revise contribuição e taxa de retorno.';
      alert(msg);
    });
  }
}
