import { Component, DestroyRef, ElementRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { APP_NAME } from '../../core/config';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { WishlistService } from '../../services/wishlist.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
})
export class Navbar {
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  protected auth = inject(AuthService);
  protected cart = inject(CartService);
  protected wishlist = inject(WishlistService);
  protected appName = APP_NAME;
  protected menuOpen = signal(false);
  protected categories = toSignal(inject(ProductService).categories$, { initialValue: [] });

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const area = (this.host.nativeElement as HTMLElement).querySelector('.account');
    if (area && !area.contains(event.target as Node)) this.menuOpen.set(false);
  }

  protected search(event: Event, value: string): void {
    event.preventDefault();
    const keyword = value.trim();
    this.router.navigate(['/products'], { queryParams: { keyword: keyword || null } });
  }

  protected logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
