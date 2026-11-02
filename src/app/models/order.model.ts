export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
}

export interface OrderItem {
  _id: string;
  count: number;
  price: number;
  product: {
    _id: string;
    title: string;
    imageCover: string;
  };
}

export interface Order {
  _id: string;
  id: number;
  totalOrderPrice: number;
  shippingPrice: number;
  taxPrice: number;
  paymentMethodType: string;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
  shippingAddress?: ShippingAddress;
  cartItems: OrderItem[];
}
