import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { ProductCard } from '../../shared/product-card/product-card';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink, ProductCard],
  templateUrl: './wishlist.html',
})
export class Wishlist {
  protected wishlist = inject(WishlistService);
}
