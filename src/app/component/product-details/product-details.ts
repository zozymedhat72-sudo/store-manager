import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { WishlistService } from '../../services/wishlist.service';
import { ProductCard } from '../../shared/product-card/product-card';
import { Stars } from '../../shared/stars/stars';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, CurrencyPipe, Stars, ProductCard],
  templateUrl: './product-details.html',
})
export class ProductDetails {
  private route = inject(ActivatedRoute);
  private service = inject(ProductService);

  protected cart = inject(CartService);
  protected wishlist = inject(WishlistService);

  protected product = signal<Product | null>(null);
  protected related = signal<Product[]>([]);
  protected loading = signal(true);
  protected error = signal(false);
  protected activeImage = signal('');
  protected qty = signal(1);

  protected gallery = computed(() => {
    const p = this.product();
    if (!p) return [];
    return Array.from(new Set([p.imageCover, ...(p.images ?? [])]));
  });

  protected hasDiscount = computed(() => {
    const p = this.product();
    return !!p?.priceAfterDiscount && p.priceAfterDiscount < p.price;
  });

  protected finalPrice = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return this.hasDiscount() ? p.priceAfterDiscount! : p.price;
  });

  protected discount = computed(() => {
    const p = this.product();
    return p && this.hasDiscount() ? Math.round((1 - p.priceAfterDiscount! / p.price) * 100) : 0;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => params.get('id') ?? ''),
        tap(() => {
          this.loading.set(true);
          this.error.set(false);
          this.related.set([]);
          this.qty.set(1);
        }),
        switchMap((id) =>
          this.service.getProduct(id).pipe(
            switchMap((product) =>
              this.service.getProducts({ category: product.category?._id, limit: 9 }).pipe(
                map((res) => ({
                  product,
                  related: res.data.filter((p) => p._id !== product._id).slice(0, 8),
                })),
                catchError(() => of({ product, related: [] as Product[] })),
              ),
            ),
            catchError(() => {
              this.error.set(true);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        if (result) {
          this.product.set(result.product);
          this.related.set(result.related);
          this.activeImage.set(result.product.imageCover);
        }
        this.loading.set(false);
      });
  }

  protected changeQty(step: number): void {
    const max = this.product()?.quantity ?? 1;
    this.qty.update((q) => Math.min(Math.max(1, q + step), Math.max(max, 1)));
  }

  protected addToCart(): void {
    const p = this.product();
    if (p) this.cart.add(p._id, this.qty());
  }
}
