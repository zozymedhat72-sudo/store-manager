import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from '../core/config';
import { AuthResponse, RegisterData, User } from '../models/auth.model';
import { ToastService } from './toast.service';

const TOKEN_KEY = 'souqi_token';
const USER_KEY = 'souqi_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);

  readonly token = signal<string | null>(this.readStorage(TOKEN_KEY));
  readonly user = signal<User | null>(this.readUser());
  readonly isLoggedIn = computed(() => !!this.token());
  readonly firstName = computed(() => this.user()?.name?.split(' ')[0] ?? '');

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/signin`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  register(data: RegisterData) {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/signup`, data)
      .pipe(tap((res) => res.token && this.setSession(res)));
  }

  forgotPassword(email: string) {
    return this.http.post(`${API_URL}/auth/forgotPasswords`, { email });
  }

  verifyResetCode(resetCode: string) {
    return this.http.post(`${API_URL}/auth/verifyResetCode`, { resetCode });
  }

  resetPassword(email: string, newPassword: string) {
    return this.http.put(`${API_URL}/auth/resetPassword`, { email, newPassword });
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/']);
  }

  expire(): void {
    this.clearSession();
    this.toast.error('Your session has expired, please sign in again.');
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }

  userId(): string | null {
    const token = this.token();
    if (!token) return null;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload)).id ?? null;
    } catch {
      return null;
    }
  }

  private setSession(res: AuthResponse): void {
    this.token.set(res.token);
    this.user.set(res.user);
    try {
      localStorage.setItem(TOKEN_KEY, res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    } catch {}
  }

  private clearSession(): void {
    this.token.set(null);
    this.user.set(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  }

  private readStorage(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private readUser(): User | null {
    const raw = this.readStorage(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
