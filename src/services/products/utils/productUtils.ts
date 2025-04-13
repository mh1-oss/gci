
import { products, categories } from "@/data/initialData";
import type { Product } from '@/utils/models/types';
import type { Product as InitialDataProduct } from '@/data/initialData';
import { isRlsInfiniteRecursionError, isRlsPolicyError as checkRlsPolicyError } from './rlsErrorHandler';

/**
 * Check if an error is related to RLS policy issues
 * Re-export from rlsErrorHandler
 */
export const isRlsPolicyError = checkRlsPolicyError;

/**
 * Get fallback products from initial data
 */
export const getFallbackProducts = (): InitialDataProduct[] => {
  console.log('Using fallback product data');
  return products;
};

/**
 * Get a fallback product by ID from initial data
 */
export const getFallbackProductById = (id: string): InitialDataProduct | null => {
  console.log('Using fallback product data for ID:', id);
  return products.find(p => p.id === id) || null;
};

/**
 * Get a fallback category name from initial data
 */
export const getFallbackCategoryName = (categoryId: string): string => {
  const category = categories.find(c => c.id === categoryId);
  return category ? category.name : '';
};

/**
 * Map database product to InitialDataProduct type
 */
export const mapDbToInitialDataProduct = (dbProduct: any): InitialDataProduct => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: Number(dbProduct.price),
    categoryId: dbProduct.category_id || '',
    image: dbProduct.image_url || '/placeholder.svg',
    images: dbProduct.image_url ? [dbProduct.image_url] : ['/placeholder.svg'], 
    featured: Boolean(dbProduct.featured) || false,
    specifications: dbProduct.specifications || {},
    colors: dbProduct.colors || [],
    mediaGallery: dbProduct.media_gallery || []
  };
};

/**
 * Map database product to Product type
 */
export const mapDbToProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: Number(dbProduct.price),
    categoryId: dbProduct.category_id || '',
    image: dbProduct.image_url || '/placeholder.svg',
    images: dbProduct.image_url ? [dbProduct.image_url] : ['/placeholder.svg'], 
    featured: Boolean(dbProduct.featured) || false,
    stock: dbProduct.stock_quantity || 0,
    specifications: dbProduct.specifications || {},
    colors: dbProduct.colors || [],
    mediaGallery: dbProduct.media_gallery || []
  };
};

/**
 * Map InitialDataProduct to Product type
 */
export const mapInitialToProduct = (initialProduct: InitialDataProduct): Product => {
  return {
    ...initialProduct,
    images: initialProduct.images || [initialProduct.image],
    stock: 0 // Default stock since it's not in initial data
  };
};
