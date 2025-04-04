
import type { Product as InitialDataProduct } from '@/data/initialData';
import { DbProduct, Product } from './types';

export function mapDbProductToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    category: dbProduct.categories?.name || '',
    price: dbProduct.price,
    images: [dbProduct.image_url || '/placeholder.svg'],
    stock: dbProduct.stock_quantity || 0,
    created_at: dbProduct.created_at
  };
}

export function mapInitialDataProductToDbProduct(product: Omit<InitialDataProduct, 'id'>): { 
  name: string;
  description: string;
  category_id: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  image_url: string | null;
} {
  return {
    name: product.name,
    description: product.description,
    category_id: product.categoryId,
    price: product.price,
    cost_price: product.price * 0.7,
    stock_quantity: 0,
    image_url: product.image !== '/placeholder.svg' ? product.image : null
  };
}
