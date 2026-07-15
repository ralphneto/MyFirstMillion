import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  template: `
    <div class="page">
      <div class="card">
        <mat-icon class="icon">account_circle</mat-icon>
        <h2>Complete seu perfil</h2>
        <p>Precisamos de mais algumas informações para personalizar sua experiência.</p>

        <form (ngSubmit)="save()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Nome completo</mat-label>
            <input matInput [(ngModel)]="name" name="name" required />
          </mat-form-field>

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
              <mat-option value="Conservative">Conservador — Priorizo segurança</mat-option>
              <mat-option value="Moderate">Moderado — Equilíbrio entre risco e retorno</mat-option>
              <mat-option value="Aggressive">Arrojado — Aceito mais risco por maior retorno</mat-option>
            </mat-select>
          </mat-form-field>

          @if (error) { <p class="error">{{ error }}</p> }

          <button mat-flat-button color="primary" type="submit" [disabled]="loading">
            {{ loading ? 'Salvando...' : 'Continuar' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-main); padding: 24px; }
    .card { background: var(--surface); border-radius: 20px; padding: 48px; max-width: 480px; width: 100%; text-align: center; }
    .icon { font-size: 56px; width: 56px; height: 56px; color: #10B981; margin-bottom: 16px; }
    h2 { font-size: 24px; font-weight: 700; margin: 0 0 8px; }
    p { color: var(--text-secondary); margin: 0 0 32px; }
    .form { display: flex; flex-direction: column; gap: 12px; text-align: left; }
    .form mat-form-field { width: 100%; }
    .form button { height: 48px; font-size: 16px; font-weight: 600; margin-top: 8px; }
    .error { color: #EF4444; font-size: 13px; margin: 0; }
  `]
})
export class CompleteProfileComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = this.auth.user()?.name ?? '';
  currency = 'BRL';
  riskProfile = 'Moderate';
  loading = false;
  error = '';

  save() {
    this.loading = true;
    this.error = '';
    this.auth.completeProfile(this.name, this.currency, this.riskProfile).subscribe({
      next: ({ token }) => {
        this.auth.setToken(token);
        this.router.navigate(['/app']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Erro ao salvar perfil. Tente novamente.';
      }
    });
  }
}
