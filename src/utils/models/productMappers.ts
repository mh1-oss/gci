
import { DbProduct, Product } from './types';
import type { Product as InitialDataProduct } from '@/data/initialData';

export const mapDbProductToProduct = (dbProduct: DbProduct): Product => {
  console.log('Mapping DB product to app model:', dbProduct);
  
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: Number(dbProduct.price) || 0,
    categoryId: dbProduct.category_id || '',
    image: dbProduct.image_url || '/placeholder.svg',
    stock: dbProduct.stock_quantity || 0,
    category: dbProduct.categories?.name || '',
    featured: false,
    images: dbProduct.image_url ? [dbProduct.image_url] : ['/placeholder.svg'],
    colors: [],
    specifications: {},
    mediaGallery: [],
  };
};

export const mapProductToDbProduct = (product: Product): DbProduct => {
  console.log('Mapping app model to DB product:', product);
  
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    cost_price: product.price * 0.7, // Default cost to 70% of price if not specified
    stock_quantity: product.stock || 0,
    category_id: product.categoryId || null,
    image_url: product.image !== '/placeholder.svg' ? product.image : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const mapInitialDataProductToDbProduct = (product: Omit<Product, 'id'>): Omit<DbProduct, 'id'> => {
  console.log('Mapping initial data product to DB product:', product);
  
  return {
    name: product.name,
    description: product.description || '',
    price: product.price,
    cost_price: product.price * 0.7, // Default cost to 70% of price if not specified
    stock_quantity: product.stock || 0,
    category_id: product.categoryId || null,
    image_url: product.image !== '/placeholder.svg' ? product.image : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};
