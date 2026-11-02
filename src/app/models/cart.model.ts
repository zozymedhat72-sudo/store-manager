export interface CartProduct {
  _id: string;
  id: string;
  title: string;
  imageCover: string;
  ratingsAverage: number;
  quantity: number;
  category?: { _id: string; name: string };
  brand?: { _id: string; name: string };
}

export interface CartItem {
  _id: string;
  count: number;
  price: number;
  product: CartProduct;
}

export interface Cart {
  _id: string;
  products: CartItem[];
  totalCartPrice: number;
}

export interface CartResponse {
  status: string;
  numOfCartItems: number;
  cartId?: string;
  data: Cart;
}
