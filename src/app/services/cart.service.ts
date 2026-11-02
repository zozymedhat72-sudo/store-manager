import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { API_URL } from '../core/config';
import { errorMessage } from '../core/errors';
import { Cart, CartResponse } from '../models/cart.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly cart = signal<Cart | null>(null);
  readonly cartId = signal<string | null>(null);
  readonly count = signal(0);
  readonly loading = signal(false);
  readonly busy = signal<string | null>(null);

  readonly items = computed(() => this.cart()?.products ?? []);
  readonly total = computed(() => this.items().reduce((sum, i) => sum + i.price * i.count, 0));

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) this.load().subscribe();
      else this.reset();
    });
  }

  load() {
    this.loading.set(true);
    return this.http.get<CartResponse>(`${API_URL}/cart`).pipe(
      tap((res) => {
        this.cart.set(res.data);
        this.cartId.set(res.cartId ?? res.data?._id ?? null);
        this.count.set(res.numOfCartItems ?? res.data?.products?.length ?? 0);
      }),
      catchError(() => {
        this.reset();
        return of(null);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  add(productId: string, qty = 1): void {
    if (!this.auth.isLoggedIn()) {
      this.askLogin();
      return;
    }
    const target = this.countOf(productId) + qty;
    this.busy.set(productId);
    this.http
      .post(`${API_URL}/cart`, { productId })
      .pipe(
        switchMap(() =>
          target > 1 && qty > 1
            ? this.http.put(`${API_URL}/cart/${productId}`, { count: target })
            : of(null),
        ),
        switchMap(() => this.load()),
        finalize(() => this.busy.set(null)),
      )
      .subscribe({
        next: () => this.toast.success('Added to your cart'),
        error: (err) => this.toast.error(errorMessage(err)),
      });
  }

  setQuantity(productId: string, count: number): void {
    if (count < 1) return;
    this.busy.set(productId);
    this.http
      .put(`${API_URL}/cart/${productId}`, { count })
      .pipe(
        switchMap(() => this.load()),
        finalize(() => this.busy.set(null)),
      )
      .subscribe({ error: (err) => this.toast.error(errorMessage(err)) });
  }

  remove(productId: string): void {
    this.busy.set(productId);
    this.http
      .delete(`${API_URL}/cart/${productId}`)
      .pipe(
        switchMap(() => this.load()),
        finalize(() => this.busy.set(null)),
      )
      .subscribe({
        next: () => this.toast.show('Item removed'),
        error: (err) => this.toast.error(errorMessage(err)),
      });
  }

  clear(): void {
    this.http.delete(`${API_URL}/cart`).subscribe({
      next: () => {
        this.reset();
        this.toast.show('Cart cleared');
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  reset(): void {
    this.cart.set(null);
    this.cartId.set(null);
    this.count.set(0);
  }

  askLogin(): void {
    this.toast.show('Please sign in to continue');
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }

  private countOf(productId: string): number {
    return this.items().find((i) => i.product._id === productId)?.count ?? 0;
  }
}
