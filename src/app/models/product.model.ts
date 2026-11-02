export interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Product {
  _id: string;
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  imageCover: string;
  images: string[];
  quantity: number;
  sold: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  category?: Category;
  brand?: Brand;
}

export interface Metadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
}

export interface ProductsResponse {
  results: number;
  metadata: Metadata;
  data: Product[];
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: string;
  brand?: string;
  sort?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
}
