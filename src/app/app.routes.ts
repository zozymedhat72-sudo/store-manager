import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Souqi | Shop online',
    loadComponent: () => import('./component/home/home').then((m) => m.Home),
  },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  {
    path: 'products',
    title: 'Souqi | Products',
    loadComponent: () => import('./component/products/products').then((m) => m.Products),
  },
  {
    path: 'products/:id',
    title: 'Souqi | Product',
    loadComponent: () =>
      import('./component/product-details/product-details').then((m) => m.ProductDetails),
  },
  {
    path: 'cart',
    title: 'Souqi | Cart',
    canActivate: [authGuard],
    loadComponent: () => import('./component/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'wishlist',
    title: 'Souqi | Wishlist',
    canActivate: [authGuard],
    loadComponent: () => import('./component/wishlist/wishlist').then((m) => m.Wishlist),
  },
  {
    path: 'checkout',
    title: 'Souqi | Checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./component/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'orders',
    title: 'Souqi | My orders',
    canActivate: [authGuard],
    loadComponent: () => import('./component/orders/orders').then((m) => m.Orders),
  },
  { path: 'allorders', redirectTo: 'orders', pathMatch: 'full' },
  {
    path: 'login',
    title: 'Souqi | Sign in',
    canActivate: [guestGuard],
    loadComponent: () => import('./component/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Souqi | Create account',
    canActivate: [guestGuard],
    loadComponent: () => import('./component/register/register').then((m) => m.Register),
  },
  {
    path: 'forgot-password',
    title: 'Souqi | Reset password',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./component/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: '**',
    title: 'Page not found',
    loadComponent: () => import('./component/not-found/not-found').then((m) => m.NotFound),
  },
];
