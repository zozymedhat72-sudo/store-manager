import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Stars } from '../stars/stars';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe, Stars],
  templateUrl: './product-card.html',
})
export class ProductCard {
  product = input.required<Product>();

  protected cart = inject(CartService);
  protected wishlist = inject(WishlistService);

  protected hasDiscount = computed(() => {
    const p = this.product();
    return !!p.priceAfterDiscount && p.priceAfterDiscount < p.price;
  });

  protected discount = computed(() => {
    const p = this.product();
    return this.hasDiscount() ? Math.round((1 - p.priceAfterDiscount! / p.price) * 100) : 0;
  });
}
