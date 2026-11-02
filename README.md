# Souqi

Online store front-end built with Angular and Bootstrap. Data comes from the public
`ecommerce.routemisr.com` API (products, categories, brands, auth, cart, wishlist, orders).

## Run

```bash
npm install
npm start
```

Open http://localhost:4200

## Pages

- Home, product list (search, category, brand, price, sort, pagination), product details
- Sign in, create account, forgot password
- Cart, wishlist, checkout (cash on delivery or card), my orders

## Structure

```
src/app
  component/    pages and layout (navbar, footer)
  shared/       product card, stars, toast
  services/     auth, products, cart, wishlist, orders, toast
  guards/       auth and guest route guards
  interceptors/ adds the auth token to API requests
  models/       typed API models
```

The shop name and API base URL are in `src/app/core/config.ts`.
