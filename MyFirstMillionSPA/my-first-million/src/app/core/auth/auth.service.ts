import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { AuthTokenPayload, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'mfm_token';

  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private _user = signal<AuthTokenPayload | null>(this.decodeToken(this._token()));

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly isProfileCompleted = computed(() => this._user()?.profile_completed === 'true');

  constructor(private http: HttpClient, private router: Router) {}

  loginWithGoogle(idToken: string) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/google`, { idToken });
  }

  loginWithEmail(email: string, password: string) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/login`, { email, password });
  }

  register(name: string, email: string, password: string) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/register`, { name, email, password });
  }

  completeProfile(name: string, currency: string, riskProfile: string) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/complete-profile`, { name, currency, riskProfile });
  }

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._token.set(token);
    this._user.set(this.decodeToken(token));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  private decodeToken(token: string | null): AuthTokenPayload | null {
    if (!token) return null;
    try {
      const payload = jwtDecode<AuthTokenPayload>(token);
      if (payload.exp * 1000 < Date.now()) {
        this.logout();
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }
}
