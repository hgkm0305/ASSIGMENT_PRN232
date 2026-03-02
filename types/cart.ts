import type { Product } from './product';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export type CartProduct = Product & { quantity: number };

