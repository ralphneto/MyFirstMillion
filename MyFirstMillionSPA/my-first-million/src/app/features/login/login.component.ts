import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatTabsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <mat-icon class="brand-icon">monetization_on</mat-icon>
          <h1>MyFirstMillion</h1>
          <p>Seu caminho para o primeiro milhão</p>
        </div>

        <div id="google-btn" class="google-btn-container"></div>

        <div class="divider"><span>ou</span></div>

        <mat-tab-group animationDuration="0ms">
          <mat-tab label="Entrar">
            <form (ngSubmit)="login()" class="form">
              <mat-form-field appearance="outline">
                <mat-label>E-mail</mat-label>
                <input matInput type="email" [(ngModel)]="email" name="email" required />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Senha</mat-label>
                <input matInput [type]="showPwd ? 'text' : 'password'" [(ngModel)]="password" name="password" required />
                <mat-icon matSuffix (click)="showPwd = !showPwd" style="cursor:pointer">
                  {{ showPwd ? 'visibility_off' : 'visibility' }}
                </mat-icon>
              </mat-form-field>
              @if (error) { <p class="error-msg">{{ error }}</p> }
              <button mat-flat-button color="primary" type="submit" [disabled]="loading">
                {{ loading ? 'Entrando...' : 'Entrar' }}
              </button>
            </form>
          </mat-tab>

          <mat-tab label="Criar Conta">
            <form (ngSubmit)="register()" class="form">
              <mat-form-field appearance="outline">
                <mat-label>Nome</mat-label>
                <input matInput [(ngModel)]="name" name="name" required />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>E-mail</mat-label>
                <input matInput type="email" [(ngModel)]="regEmail" name="regEmail" required />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Senha</mat-label>
                <input matInput type="password" [(ngModel)]="regPassword" name="regPassword" required />
              </mat-form-field>
              @if (error) { <p class="error-msg">{{ error }}</p> }
              <button mat-flat-button color="primary" type="submit" [disabled]="loading">
                {{ loading ? 'Criando...' : 'Criar Conta' }}
              </button>
            </form>
          </mat-tab>
        </mat-tab-group>

        <p class="back-link"><a routerLink="/">← Voltar ao início</a></p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-main);
      padding: 24px;
    }
    .login-card {
      background: var(--surface);
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    .login-header { text-align: center; margin-bottom: 28px; }
    .brand-icon { color: #10B981; font-size: 48px; width: 48px; height: 48px; }
    h1 { font-size: 26px; font-weight: 700; margin: 8px 0 4px; }
    p { color: var(--text-secondary); margin: 0; }
    .google-btn-container { display: flex; justify-content: center; margin-bottom: 16px; min-height: 44px; }
    .divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; color: var(--text-secondary); font-size: 13px; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
    .form { display: flex; flex-direction: column; gap: 8px; padding: 16px 0 8px; }
    .form mat-form-field { width: 100%; }
    .form button { height: 48px; font-size: 16px; font-weight: 600; }
    .error-msg { color: #EF4444; font-size: 13px; margin: 0; }
    .back-link { text-align: center; margin-top: 16px; font-size: 13px; }
    .back-link a { color: var(--primary); text-decoration: none; }
  `]
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  name = '';
  regEmail = '';
  regPassword = '';
  showPwd = false;
  loading = false;
  error = '';

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/app']);
      return;
    }
    this.loadGoogleScript();
  }

  private loadGoogleScript() {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => this.initGoogle();
    document.head.appendChild(script);
  }

  private initGoogle() {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (res: any) => this.handleGoogleResponse(res)
    });
    google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'outline', size: 'large', text: 'signin_with', locale: 'pt-BR', width: 360 }
    );
  }

  private handleGoogleResponse(response: any) {
    this.loading = true;
    this.error = '';
    this.auth.loginWithGoogle(response.credential).subscribe({
      next: ({ token }) => {
        this.auth.setToken(token);
        this.navigateAfterLogin();
      },
      error: () => {
        this.loading = false;
        this.error = 'Falha na autenticação com Google.';
      }
    });
  }

  login() {
    this.loading = true;
    this.error = '';
    this.auth.loginWithEmail(this.email, this.password).subscribe({
      next: ({ token }) => {
        this.auth.setToken(token);
        this.navigateAfterLogin();
      },
      error: () => {
        this.loading = false;
        this.error = 'E-mail ou senha incorretos.';
      }
    });
  }

  register() {
    this.loading = true;
    this.error = '';
    this.auth.register(this.name, this.regEmail, this.regPassword).subscribe({
      next: ({ token }) => {
        this.auth.setToken(token);
        this.navigateAfterLogin();
      },
      error: () => {
        this.loading = false;
        this.error = 'Erro ao criar conta. Tente outro e-mail.';
      }
    });
  }

  private navigateAfterLogin() {
    if (this.auth.isProfileCompleted()) {
      this.router.navigate(['/app']);
    } else {
      this.router.navigate(['/complete-profile']);
    }
  }
}
