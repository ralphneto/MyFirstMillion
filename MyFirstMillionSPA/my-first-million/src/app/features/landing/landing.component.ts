import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="landing">
      <header class="landing-header">
        <div class="logo">
          <mat-icon>monetization_on</mat-icon>
          <span>MyFirstMillion</span>
        </div>
        <a mat-flat-button color="primary" routerLink="/login">Entrar</a>
      </header>

      <section class="hero">
        <div class="hero-content">
          <h1>Seu caminho para o<br><span class="highlight">Primeiro Milhão</span></h1>
          <p>Controle suas receitas e despesas, acompanhe suas metas de investimento e receba sugestões personalizadas para alcançar a independência financeira.</p>
          <div class="hero-actions">
            <a mat-flat-button color="primary" routerLink="/login" class="cta-btn">
              Começar Gratuitamente
            </a>
            <a mat-stroked-button routerLink="/login" class="cta-btn">
              Já tenho conta
            </a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="stat-card">
            <mat-icon class="stat-icon income">trending_up</mat-icon>
            <div>
              <div class="stat-label">Receita do Mês</div>
              <div class="stat-value income">R$ 8.500,00</div>
            </div>
          </div>
          <div class="stat-card">
            <mat-icon class="stat-icon expense">trending_down</mat-icon>
            <div>
              <div class="stat-label">Despesas do Mês</div>
              <div class="stat-value expense">R$ 3.200,00</div>
            </div>
          </div>
          <div class="stat-card goal">
            <mat-icon class="stat-icon goal-icon">emoji_events</mat-icon>
            <div>
              <div class="stat-label">Progresso: 1° Milhão</div>
              <div class="stat-value goal-val">32% • 8 anos</div>
            </div>
          </div>
        </div>
      </section>

      <section class="features">
        <h2>Tudo que você precisa</h2>
        <div class="features-grid">
          @for (feature of features; track feature.title) {
            <div class="feature-card">
              <mat-icon [style.color]="feature.color">{{ feature.icon }}</mat-icon>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          }
        </div>
      </section>

      <footer class="landing-footer">
        <p>© 2026 MyFirstMillion · www.myfirstmillion.com.br</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing { min-height: 100vh; background: #0F172A; color: white; }

    .landing-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 48px;
    }
    .logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 18px; }
    .logo mat-icon { color: #10B981; font-size: 28px; }

    .hero {
      display: grid; grid-template-columns: 1fr 1fr; gap: 60px;
      padding: 80px 48px; align-items: center; max-width: 1200px; margin: 0 auto;
    }
    h1 { font-size: 52px; font-weight: 800; line-height: 1.1; margin: 0 0 24px; }
    .highlight { color: #10B981; }
    p { color: rgba(255,255,255,0.7); font-size: 18px; line-height: 1.6; margin: 0 0 32px; }
    .hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }
    .cta-btn { padding: 0 28px; height: 48px; font-size: 16px; }

    .hero-visual { display: flex; flex-direction: column; gap: 16px; }
    .stat-card {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 20px;
      display: flex; align-items: center; gap: 16px;
    }
    .stat-icon { font-size: 32px; width: 32px; height: 32px; }
    .stat-icon.income { color: #10B981; }
    .stat-icon.expense { color: #EF4444; }
    .stat-icon.goal-icon { color: #F59E0B; }
    .stat-label { font-size: 13px; color: rgba(255,255,255,0.5); }
    .stat-value { font-size: 22px; font-weight: 700; margin-top: 2px; }
    .stat-value.income { color: #10B981; }
    .stat-value.expense { color: #EF4444; }
    .stat-value.goal-val { color: #F59E0B; }

    .features { padding: 80px 48px; max-width: 1200px; margin: 0 auto; }
    .features h2 { text-align: center; font-size: 36px; font-weight: 700; margin-bottom: 48px; }
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .feature-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 28px;
    }
    .feature-card mat-icon { font-size: 36px; width: 36px; height: 36px; margin-bottom: 16px; }
    .feature-card h3 { font-size: 18px; font-weight: 600; margin: 0 0 8px; }
    .feature-card p { color: rgba(255,255,255,0.6); margin: 0; font-size: 14px; }

    .landing-footer { text-align: center; padding: 32px; color: rgba(255,255,255,0.3); font-size: 13px; }

    @media (max-width: 768px) {
      .landing-header { padding: 16px 20px; }
      .hero { grid-template-columns: 1fr; padding: 40px 20px; gap: 40px; }
      h1 { font-size: 36px; }
      .features { padding: 40px 20px; }
      .features-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LandingComponent {
  features = [
    { icon: 'receipt_long', color: '#6366F1', title: 'Controle de Transações', description: 'Registre receitas e despesas com categorias detalhadas. Parcele compras e configure recorrências automáticas.' },
    { icon: 'bar_chart', color: '#10B981', title: 'Relatórios Detalhados', description: 'Visualize seus gastos por categoria, evolução mensal e tendências para tomar decisões mais inteligentes.' },
    { icon: 'emoji_events', color: '#F59E0B', title: 'Metas Financeiras', description: 'Defina sua meta do Primeiro Milhão e veja projeções de quando você chegará lá com juros compostos.' },
    { icon: 'trending_up', color: '#EF4444', title: 'Sugestões de Investimento', description: 'Recomendações personalizadas baseadas no seu perfil de risco: CDB, Tesouro Direto, FIIs, Ações.' },
    { icon: 'account_balance_wallet', color: '#8B5CF6', title: 'Múltiplas Contas', description: 'Gerencie contas correntes, poupança, cartão de crédito e investimentos em um único lugar.' },
    { icon: 'calendar_month', color: '#14B8A6', title: 'Orçamento Mensal', description: 'Defina limites por categoria e receba alertas quando estiver próximo de ultrapassar seu orçamento.' },
  ];
}
