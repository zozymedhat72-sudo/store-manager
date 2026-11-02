import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { API_URL } from '../core/config';
import { Order, ShippingAddress } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  createCashOrder(cartId: string, shippingAddress: ShippingAddress) {
    return this.http.post(`${API_URL}/orders/${cartId}`, { shippingAddress });
  }

  createCheckoutSession(cartId: string, shippingAddress: ShippingAddress) {
    const url = window.location.origin;
    return this.http.post<{ session: { url: string } }>(
      `${API_URL}/orders/checkout-session/${cartId}?url=${encodeURIComponent(url)}`,
      { shippingAddress },
    );
  }

  getUserOrders(userId: string) {
    return this.http
      .get<Order[] | { data: Order[] }>(`${API_URL}/orders/user/${userId}`)
      .pipe(map((res) => (Array.isArray(res) ? res : (res.data ?? []))));
  }
}
