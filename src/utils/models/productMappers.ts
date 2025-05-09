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
    images: dbProduct.image_url ? [dbProduct.image_url] : ['/placeholder.svg'],
    stock_quantity: dbProduct.stock_quantity || 0, // Changed from 'stock' to 'stock_quantity'
    category: dbProduct.categories && typeof dbProduct.categories === 'object' && dbProduct.categories !== null && 'name' in dbProduct.categories 
      ? dbProduct.categories.name as string
      : '',
    featured: Boolean(dbProduct.featured) || false,
    colors: Array.isArray(dbProduct.colors) ? dbProduct.colors as string[] : [],
    specifications: typeof dbProduct.specifications === 'object' && dbProduct.specifications !== null 
      ? dbProduct.specifications as Record<string, string> 
      : {},
    mediaGallery: Array.isArray(dbProduct.media_gallery) 
      ? dbProduct.media_gallery as { url: string; type: 'image' | 'video' }[] 
      : [],
  };
};

export const mapProductToDbProduct = (product: Product): DbProduct => {
  console.log('Mapping app product to DB product:', product);
  
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    cost_price: product.price * 0.7, // Default cost to 70% of price if not specified
    stock_quantity: product.stock_quantity || 0,
    category_id: product.categoryId || null,
    image_url: product.image !== '/placeholder.svg' ? product.image : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    featured: product.featured || false,
    colors: product.colors || [],
    specifications: product.specifications || {},
    media_gallery: product.mediaGallery || [],
    categories: null // We don't need to send this to DB
  };
};

export const mapInitialDataProductToDbProduct = (product: Omit<Product, 'id'>): Omit<DbProduct, 'id'> => {
  console.log('Mapping initial data product to DB product:', product);
  
  return {
    name: product.name,
    description: product.description || '',
    price: product.price,
    cost_price: product.price * 0.7, // Default cost to 70% of price if not specified
    stock_quantity: product.stock_quantity || 0,
    category_id: product.categoryId || null,
    image_url: product.image !== '/placeholder.svg' ? product.image : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    featured: product.featured || false,
    colors: product.colors || [],
    specifications: product.specifications || {},
    media_gallery: product.mediaGallery || [],
    categories: null // We don't need to send this to DB
  };
};
