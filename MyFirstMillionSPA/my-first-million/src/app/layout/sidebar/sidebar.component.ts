import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <mat-icon class="brand-icon">monetization_on</mat-icon>
        <span class="brand-text">MyFirstMillion</span>
      </div>

      <nav class="sidebar-nav">
        @for (item of navItems; track item.route) {
          <a
            class="nav-item"
            [routerLink]="item.route"
            routerLinkActive="active"
          >
            <mat-icon>{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item logout-btn" (click)="auth.logout()">
          <mat-icon>logout</mat-icon>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      background: var(--sidebar-bg);
      color: white;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .brand-icon { color: #10B981; font-size: 28px; width: 28px; height: 28px; }
    .brand-text { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
    .sidebar-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      border: none;
      background: transparent;
      width: 100%;
      cursor: pointer;
      font-size: 14px;
      font-family: inherit;
      transition: all 0.15s;
      border-radius: 8px;
      margin: 0 8px;
      width: calc(100% - 16px);
    }
    .nav-item:hover, .nav-item.active {
      background: rgba(16,185,129,0.15);
      color: white;
    }
    .nav-item.active mat-icon { color: #10B981; }
    .sidebar-footer { padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.1); }
    .logout-btn { color: rgba(255,255,255,0.5); }
    .logout-btn:hover { background: rgba(239,68,68,0.15); color: #EF4444; }

    @media (max-width: 768px) {
      .sidebar { display: none; }
    }
  `]
})
export class SidebarComponent {
  auth = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard' },
    { label: 'Transações', icon: 'receipt_long', route: '/app/transactions' },
    { label: 'Contas', icon: 'account_balance_wallet', route: '/app/accounts' },
    { label: 'Metas', icon: 'emoji_events', route: '/app/goals' },
    { label: 'Relatórios', icon: 'bar_chart', route: '/app/reports' },
    { label: 'Perfil', icon: 'person', route: '/app/profile' },
  ];
}
