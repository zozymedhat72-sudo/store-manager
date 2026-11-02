import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/errors';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './checkout.html',
})
export class Checkout {
  private fb = inject(FormBuilder);
  private orders = inject(OrderService);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected cart = inject(CartService);
  protected submitting = signal(false);
  protected error = signal('');
  protected payment = signal<'cash' | 'card'>('cash');

  protected form = this.fb.nonNullable.group({
    details: ['', [Validators.required, Validators.minLength(5)]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
  });

  protected invalid(name: 'details' | 'phone' | 'city'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected submit(): void {
    this.error.set('');
    const cartId = this.cart.cartId();
    if (this.form.invalid || !cartId) {
      this.form.markAllAsTouched();
      return;
    }

    const address = this.form.getRawValue();
    this.submitting.set(true);

    if (this.payment() === 'cash') {
      this.orders.createCashOrder(cartId, address).subscribe({
        next: () => {
          this.cart.reset();
          this.toast.success('Your order has been placed');
          this.router.navigate(['/orders']);
        },
        error: (err) => {
          this.error.set(errorMessage(err));
          this.submitting.set(false);
        },
      });
    } else {
      this.orders.createCheckoutSession(cartId, address).subscribe({
        next: (res) => {
          window.location.href = res.session.url;
        },
        error: (err) => {
          this.error.set(errorMessage(err));
          this.submitting.set(false);
        },
      });
    }
  }
}
