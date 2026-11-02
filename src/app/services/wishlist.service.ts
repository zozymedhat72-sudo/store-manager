import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { API_URL } from '../core/config';
import { errorMessage } from '../core/errors';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private toast = inject(ToastService);

  readonly items = signal<Product[]>([]);
  readonly ids = signal<string[]>([]);
  readonly loading = signal(false);
  readonly count = computed(() => this.ids().length);

  constructor() {
    effect(() => {
      if (this.auth.isLoggedIn()) this.load();
      else {
        this.items.set([]);
        this.ids.set([]);
      }
    });
  }

  has(productId: string): boolean {
    return this.ids().includes(productId);
  }

  load(): void {
    this.loading.set(true);
    this.http
      .get<{ data: Product[] }>(`${API_URL}/wishlist`)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.items.set(res.data);
          this.ids.set(res.data.map((p) => p._id));
        },
        error: () => {},
      });
  }

  toggle(productId: string): void {
    if (!this.auth.isLoggedIn()) {
      this.cart.askLogin();
      return;
    }
    if (this.has(productId)) {
      this.http.delete<{ data: string[] }>(`${API_URL}/wishlist/${productId}`).subscribe({
        next: (res) => {
          this.ids.set(res.data);
          this.items.update((list) => list.filter((p) => p._id !== productId));
          this.toast.show('Removed from wishlist');
        },
        error: (err) => this.toast.error(errorMessage(err)),
      });
    } else {
      this.http.post<{ data: string[] }>(`${API_URL}/wishlist`, { productId }).subscribe({
        next: (res) => {
          this.ids.set(res.data);
          this.toast.success('Saved to your wishlist');
        },
        error: (err) => this.toast.error(errorMessage(err)),
      });
    }
  }
}
