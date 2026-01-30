export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  image?: string;
}
