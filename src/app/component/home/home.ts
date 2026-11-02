import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard],
  templateUrl: './home.html',
})
export class Home {
  private products = inject(ProductService);
  private destroyRef = inject(DestroyRef);

  protected slides = [
    {
      title: 'New season, new deals',
      text: 'Fresh arrivals across every category, with free delivery on your first order.',
      cta: 'Shop now',
      link: { sort: '' },
      theme: 'slide-a',
    },
    {
      title: 'Best sellers',
      text: 'The products everyone is talking about. Grab them before they sell out.',
      cta: 'See best sellers',
      link: { sort: '-sold' },
      theme: 'slide-b',
    },
    {
      title: 'Top rated picks',
      text: 'Hand-picked favourites with the highest customer ratings.',
      cta: 'Browse top rated',
      link: { sort: '-ratingsAverage' },
      theme: 'slide-c',
    },
  ];

  protected perks = [
    { icon: 'bi-truck', title: 'Fast delivery', text: 'To your door in 2-4 days' },
    { icon: 'bi-shield-check', title: 'Secure payment', text: 'Card or cash on delivery' },
    { icon: 'bi-arrow-repeat', title: 'Easy returns', text: '14 days to change your mind' },
    { icon: 'bi-headset', title: 'Support', text: 'We are here every day' },
  ];

  protected current = signal(0);
  protected loading = signal(true);
  protected error = signal(false);
  protected bestSellers = signal<Product[]>([]);
  protected topRated = signal<Product[]>([]);
  protected categories = toSignal(this.products.categories$, { initialValue: [] });
  protected brands = toSignal(this.products.brands$, { initialValue: [] });

  constructor() {
    const timer = setInterval(() => this.next(), 5000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
    this.load();
  }

  protected go(index: number): void {
    this.current.set(index);
  }

  protected next(): void {
    this.current.update((i) => (i + 1) % this.slides.length);
  }

  protected prev(): void {
    this.current.update((i) => (i - 1 + this.slides.length) % this.slides.length);
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    forkJoin({
      best: this.products.getProducts({ limit: 10, sort: '-sold' }),
      top: this.products.getProducts({ limit: 10, sort: '-ratingsAverage' }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ best, top }) => {
          this.bestSellers.set(best.data);
          this.topRated.set(top.data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
}
