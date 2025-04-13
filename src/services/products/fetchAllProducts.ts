
import { supabase } from "@/integrations/supabase/client";
import { Product } from '@/utils/models/types';
import { getFallbackProducts } from './utils/productUtils';
import { isRlsPolicyError, createRlsError } from '@/services/rls/rlsErrorHandler';

/**
 * Fetch all products
 * Returns array of products or throws an error
 */
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    // Try fetching products from Supabase
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name
        )
      `);
    
    if (error) {
      if (isRlsPolicyError(error)) {
        console.warn('RLS policy issue detected, using fallback data');
        return getFallbackProducts();
      }
      
      console.error('Error fetching products:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No products found in database, using fallback data');
      return getFallbackProducts();
    }
    
    // Map DB products to frontend Product type
    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: Number(product.price) || 0,
      categoryId: product.category_id || '',
      image: product.image_url || '/placeholder.svg',
      images: product.image_url ? [product.image_url] : ['/placeholder.svg'],
      category: product.categories && product.categories.name ? product.categories.name : '',
      stock: product.stock_quantity || 0,
      featured: Boolean(product.featured) || false,
      colors: product.colors || [],
      specifications: product.specifications || {},
      mediaGallery: product.media_gallery || []
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    if (isRlsPolicyError(error)) {
      return getFallbackProducts();
    }
    throw error;
  }
};
