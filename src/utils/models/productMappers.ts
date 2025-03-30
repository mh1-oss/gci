
import type { Product } from '@/data/initialData';
import { DbProduct } from './types';

export function mapDbProductToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    categoryId: dbProduct.category_id || '',
    price: dbProduct.price,
    image: dbProduct.image_url || '/placeholder.svg',
    featured: false,
    colors: [],
    specifications: {},
    mediaGallery: []
  };
}

export function mapProductToDbProduct(product: Omit<Product, 'id'>): Omit<DbProduct, 'id' | 'created_at' | 'updated_at'> {
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
