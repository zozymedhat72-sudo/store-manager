import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, of, shareReplay } from 'rxjs';
import { API_URL } from '../core/config';
import { Brand, Category, Product, ProductQuery, ProductsResponse } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  readonly categories$ = this.http.get<{ data: Category[] }>(`${API_URL}/categories`).pipe(
    map((res) => res.data),
    catchError(() => of([] as Category[])),
    shareReplay(1),
  );

  readonly brands$ = this.http.get<{ data: Brand[] }>(`${API_URL}/brands`).pipe(
    map((res) => res.data),
    catchError(() => of([] as Brand[])),
    shareReplay(1),
  );

  getProducts(query: ProductQuery = {}) {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.keyword) params = params.set('keyword', query.keyword);
    if (query.category) params = params.set('category[in]', query.category);
    if (query.brand) params = params.set('brand', query.brand);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.minPrice != null) params = params.set('price[gte]', query.minPrice);
    if (query.maxPrice != null) params = params.set('price[lte]', query.maxPrice);
    return this.http.get<ProductsResponse>(`${API_URL}/products`, { params });
  }

  getProduct(id: string) {
    return this.http.get<{ data: Product }>(`${API_URL}/products/${id}`).pipe(map((res) => res.data));
  }
}
