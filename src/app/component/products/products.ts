import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { ProductCard } from '../../shared/product-card/product-card';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-products',
  imports: [ProductCard],
  templateUrl: './products.html',
})
export class Products {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ProductService);

  protected sortOptions = [
    { value: '', label: 'Recommended' },
    { value: '-sold', label: 'Best selling' },
    { value: '-ratingsAverage', label: 'Top rated' },
    { value: 'price', label: 'Price: low to high' },
    { value: '-price', label: 'Price: high to low' },
  ];

  protected categories = toSignal(this.service.categories$, { initialValue: [] });
  protected brands = toSignal(this.service.brands$, { initialValue: [] });

  protected items = signal<Product[]>([]);
  protected loading = signal(true);
  protected error = signal(false);
  protected pages = signal(1);
  protected filtersOpen = signal(false);

  private params = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  protected keyword = computed(() => this.params().get('keyword') ?? '');
  protected category = computed(() => this.params().get('category') ?? '');
  protected brand = computed(() => this.params().get('brand') ?? '');
  protected sort = computed(() => this.params().get('sort') ?? '');
  protected minPrice = computed(() => this.params().get('min') ?? '');
  protected maxPrice = computed(() => this.params().get('max') ?? '');
  protected page = computed(() => Number(this.params().get('page')) || 1);

  protected pageList = computed(() => Array.from({ length: this.pages() }, (_, i) => i + 1));

  protected hasFilters = computed(
    () => !!(this.keyword() || this.category() || this.brand() || this.minPrice() || this.maxPrice()),
  );

  protected title = computed(() => {
    if (this.keyword()) return `Results for "${this.keyword()}"`;
    const cat = this.categories().find((c) => c._id === this.category());
    return cat ? cat.name : 'All products';
  });

  constructor() {
    this.route.queryParamMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(false);
        }),
        switchMap((p) =>
          this.service
            .getProducts({
              page: Number(p.get('page')) || 1,
              limit: PAGE_SIZE,
              keyword: p.get('keyword') || undefined,
              category: p.get('category') || undefined,
              brand: p.get('brand') || undefined,
              sort: p.get('sort') || undefined,
              minPrice: p.get('min') ? Number(p.get('min')) : null,
              maxPrice: p.get('max') ? Number(p.get('max')) : null,
            })
            .pipe(
              catchError(() => {
                this.error.set(true);
                return of(null);
              }),
            ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.items.set(res?.data ?? []);
        this.pages.set(res?.metadata?.numberOfPages ?? 1);
        this.loading.set(false);
      });
  }

  protected setParam(key: string, value: string | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [key]: value || null, page: null },
      queryParamsHandling: 'merge',
    });
  }

  protected applyPrice(min: string, max: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { min: min || null, max: max || null, page: null },
      queryParamsHandling: 'merge',
    });
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.pages()) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page > 1 ? page : null },
      queryParamsHandling: 'merge',
    });
  }

  protected clearFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { keyword: null, category: null, brand: null, min: null, max: null, page: null },
      queryParamsHandling: 'merge',
    });
  }
}
