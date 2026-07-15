import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatButtonModule, RouterLink],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <mat-icon class="brand-icon-mobile">monetization_on</mat-icon>
        <span class="brand-text-mobile">MyFirstMillion</span>
      </div>
      <div class="topbar-right">
        @if (user()?.picture) {
          <img [src]="user()!.picture" [alt]="user()!.name" class="user-avatar" [matMenuTriggerFor]="userMenu" />
        } @else {
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
          </button>
        }
        <mat-menu #userMenu="matMenu">
          <div class="user-menu-header">
            <strong>{{ user()?.name }}</strong>
            <small>{{ user()?.email }}</small>
          </div>
          <a mat-menu-item routerLink="/app/profile">
            <mat-icon>person</mat-icon>
            <span>Meu Perfil</span>
          </a>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
            <span>Sair</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 56px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .topbar-left { display: none; align-items: center; gap: 8px; }
    .brand-icon-mobile { color: #10B981; }
    .brand-text-mobile { font-weight: 700; font-size: 15px; }
    .topbar-right { display: flex; align-items: center; gap: 8px; }
    .user-avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid #10B981;
    }
    .user-menu-header {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid var(--border);
      margin-bottom: 4px;
    }
    .user-menu-header small { color: var(--text-secondary); font-size: 12px; }
    @media (max-width: 768px) {
      .topbar-left { display: flex; }
    }
  `]
})
export class TopbarComponent {
  auth = inject(AuthService);
  user = this.auth.user;
}
