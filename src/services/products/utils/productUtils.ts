
// If this file doesn't exist yet, we'll create it with the needed functions
import { products } from '@/data/initialData';
import type { Product as InitialDataProduct } from '@/data/initialData';
import { DbProduct, Product } from '@/utils/models/types';

/**
 * Get a product by ID from the fallback data
 */
export const getFallbackProductById = (id: string): InitialDataProduct | null => {
  const product = products.find(p => p.id === id);
  return product || null;
};

/**
 * Get all products from fallback data
 */
export const getFallbackProducts = (): Product[] => {
  return products.map(mapInitialToProduct);
};

/**
 * Check if an error is related to RLS policy issues
 */
export const isRlsPolicyError = (error: any): boolean => {
  if (!error) return false;
  
  const message = typeof error === 'string' 
    ? error 
    : error.message || error.error || '';
    
  return message.toLowerCase().includes('policy') || 
         message.toLowerCase().includes('permission denied') ||
         message.toLowerCase().includes('rls');
};

/**
 * Map database product to initial data product format
 */
export const mapDbToInitialDataProduct = (dbProduct: any): InitialDataProduct => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: Number(dbProduct.price) || 0,
    categoryId: dbProduct.category_id || '',
    image: dbProduct.image_url || '/placeholder.svg',
    featured: dbProduct.featured !== undefined ? Boolean(dbProduct.featured) : false,
    colors: Array.isArray(dbProduct.colors) ? dbProduct.colors : [],
    specifications: typeof dbProduct.specifications === 'object' && dbProduct.specifications !== null 
      ? dbProduct.specifications 
      : {},
    stock_quantity: dbProduct.stock_quantity || 0, // Make sure to include stock_quantity
    mediaGallery: Array.isArray(dbProduct.media_gallery) 
      ? dbProduct.media_gallery 
      : []
  };
};

/**
 * Map database product to app Product type
 */
export const mapDbToProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    price: Number(dbProduct.price) || 0,
    categoryId: dbProduct.category_id || '',
    image: dbProduct.image_url || '/placeholder.svg',
    images: dbProduct.image_url ? [dbProduct.image_url] : ['/placeholder.svg'],
    category: '',
    stock_quantity: dbProduct.stock_quantity || 0,
    featured: dbProduct.featured !== undefined ? Boolean(dbProduct.featured) : false,
    colors: Array.isArray(dbProduct.colors) ? dbProduct.colors : [],
    specifications: typeof dbProduct.specifications === 'object' && dbProduct.specifications !== null 
      ? dbProduct.specifications 
      : {},
    mediaGallery: Array.isArray(dbProduct.media_gallery) 
      ? dbProduct.media_gallery 
      : []
  };
};

/**
 * Map initial data product to app Product type
 */
export const mapInitialToProduct = (initialProduct: InitialDataProduct): Product => {
  return {
    id: initialProduct.id,
    name: initialProduct.name,
    description: initialProduct.description || '',
    price: initialProduct.price,
    categoryId: initialProduct.categoryId || '',
    image: initialProduct.image || '/placeholder.svg',
    images: initialProduct.image ? [initialProduct.image] : ['/placeholder.svg'],
    category: '',
    stock_quantity: initialProduct.stock_quantity || 0, // Use the stock_quantity we added
    featured: initialProduct.featured || false,
    colors: initialProduct.colors || [],
    specifications: initialProduct.specifications || {},
    mediaGallery: initialProduct.mediaGallery || []
  };
};
