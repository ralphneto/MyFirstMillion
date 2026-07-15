import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../core/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <div class="profile-page">
      <h1>Meu Perfil</h1>

      <div class="profile-card panel">
        <div class="profile-header">
          @if (user?.pictureUrl) {
            <img [src]="user!.pictureUrl" [alt]="user!.name" class="avatar" />
          } @else {
            <div class="avatar-placeholder">
              <mat-icon>person</mat-icon>
            </div>
          }
          <div>
            <h2>{{ user?.name }}</h2>
            <p>{{ user?.email }}</p>
          </div>
        </div>

        <form (ngSubmit)="save()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Moeda principal</mat-label>
            <mat-select [(ngModel)]="currency" name="currency">
              <mat-option value="BRL">BRL — Real Brasileiro</mat-option>
              <mat-option value="USD">USD — Dólar</mat-option>
              <mat-option value="EUR">EUR — Euro</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Perfil de investidor</mat-label>
            <mat-select [(ngModel)]="riskProfile" name="riskProfile">
              <mat-option value="Conservative">Conservador</mat-option>
              <mat-option value="Moderate">Moderado</mat-option>
              <mat-option value="Aggressive">Arrojado</mat-option>
            </mat-select>
          </mat-form-field>

          @if (saved) { <p class="success">Perfil atualizado com sucesso!</p> }

          <button mat-flat-button color="primary" type="submit">Salvar Alterações</button>
        </form>

        <div class="logout-section">
          <button mat-stroked-button color="warn" (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Sair da conta
          </button>
        </div>
      </div>

      <div class="panel stats-panel">
        <h3>Informações da conta</h3>
        <div class="stat-row">
          <span>Membro desde</span>
          <span>{{ user?.createdAt | date:'dd/MM/yyyy' }}</span>
        </div>
        <div class="stat-row">
          <span>Perfil</span>
          <span class="badge">{{ riskProfileLabel }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page { display: flex; flex-direction: column; gap: 24px; max-width: 640px; }
    h1 { font-size: 26px; font-weight: 700; margin: 0 0 4px; }
    .panel { background: var(--surface); border-radius: 16px; padding: 24px; }
    .profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #10B981; }
    .avatar-placeholder { width: 80px; height: 80px; border-radius: 50%; background: var(--bg-main); display: flex; align-items: center; justify-content: center; }
    .avatar-placeholder mat-icon { font-size: 40px; width: 40px; height: 40px; color: var(--text-secondary); }
    .profile-header h2 { font-size: 22px; font-weight: 700; margin: 0 0 4px; }
    .profile-header p { color: var(--text-secondary); margin: 0; }
    .form { display: flex; flex-direction: column; gap: 12px; }
    .form mat-form-field { width: 100%; }
    .form button { height: 48px; font-size: 16px; font-weight: 600; }
    .success { color: #10B981; font-size: 13px; margin: 0; }
    .logout-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
    .stats-panel h3 { font-size: 16px; font-weight: 600; margin: 0 0 16px; }
    .stat-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 14px; }
    .stat-row:last-child { border: none; }
    .badge { background: #D1FAE5; color: #065F46; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
  `]
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private http = inject(HttpClient);

  user: any = null;
  currency = 'BRL';
  riskProfile = 'Moderate';
  saved = false;

  get riskProfileLabel() {
    return ({ Conservative: 'Conservador', Moderate: 'Moderado', Aggressive: 'Arrojado' } as any)[this.riskProfile] ?? this.riskProfile;
  }

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/auth/me`).subscribe(u => {
      this.user = u;
      this.currency = u.currency ?? 'BRL';
      this.riskProfile = u.riskProfile ?? 'Moderate';
    });
  }

  save() {
    this.auth.completeProfile(this.user.name, this.currency, this.riskProfile).subscribe(({ token }) => {
      this.auth.setToken(token);
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    });
  }
}
