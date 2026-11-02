import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order } from '../../models/order.model';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './orders.html',
})
export class Orders {
  private auth = inject(AuthService);
  private service = inject(OrderService);

  protected orders = signal<Order[]>([]);
  protected loading = signal(true);
  protected error = signal(false);

  constructor() {
    this.load();
  }

  protected load(): void {
    const userId = this.auth.userId();
    if (!userId) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(false);
    this.service.getUserOrders(userId).subscribe({
      next: (list) => {
        this.orders.set([...list].reverse());
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
