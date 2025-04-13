
import { supabase } from "@/integrations/supabase/client";
import { products } from '@/data/initialData';
import type { Product as InitialDataProduct } from '@/data/initialData';

/**
 * Check if an error is related to RLS policy issues
 */
export const isRlsPolicyError = (error: any): boolean => {
  return !!(error?.message && (
    error.message.includes("infinite recursion") || 
    error.message.includes("policy for relation") ||
    error.message.includes("user_roles")
  ));
};

/**
 * Get fallback product data from the initial data set
 */
export const getFallbackProducts = (): InitialDataProduct[] => {
  console.log('Using fallback product data');
  return products;
};

/**
 * Find a product by ID in the fallback data
 */
export const getFallbackProductById = (id: string): InitialDataProduct | null => {
  const product = products.find(p => p.id === id);
  return product || null;
};

/**
 * Map database product to InitialDataProduct format
 */
export const mapDbToInitialDataProduct = (item: any): InitialDataProduct => {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: Number(item.price) || 0,
    categoryId: item.category_id || '',
    image: item.image_url || '/placeholder.svg',
    featured: false, // Default since it's not in DB schema
    colors: [] // Default since it's not in DB schema
  };
};

/**
 * Map database product to Product format
 */
export const mapDbToProduct = (item: any): any => {
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    image: item.image_url || '/placeholder.svg',
    price: Number(item.price) || 0,
    categoryId: item.category_id || '',
    featured: false, // Default since it's not in DB schema
    images: item.image_url ? [item.image_url] : ['/placeholder.svg'],
    category: '',
    stock: item.stock_quantity || 0,
    colors: [], // Default since it's not in DB schema
    specifications: {}, // Default since it's not in DB schema
    mediaGallery: [] // Default since it's not in DB schema
  };
};

/**
 * Map initial data product to Product format (for category filtering)
 */
export const mapInitialToProduct = (p: InitialDataProduct): any => {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    image: p.image || '/placeholder.svg',
    price: p.price,
    categoryId: p.categoryId,
    featured: !!p.featured,
    images: [p.image || '/placeholder.svg'],
    category: '',
    stock: 0,
    colors: p.colors || [],
    specifications: p.specifications || {},
    mediaGallery: p.mediaGallery || []
  };
};
