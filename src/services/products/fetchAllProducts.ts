
import { supabase } from "@/integrations/supabase/client";
import { Product } from '@/utils/models/types';
import { getFallbackProducts } from './utils/productUtils';
import { isRlsPolicyError, createRlsError } from '@/services/rls/rlsErrorHandler';
import { mapDbToProduct } from './utils/productUtils';

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
    
    // Map DB products to frontend Product type with proper type handling
    return data.map(product => {
      // Safely handle categories that might be null
      const categoryName = 
        product.categories && 
        typeof product.categories === 'object' && 
        product.categories !== null && 
        'name' in product.categories
          ? String(product.categories.name) // Ensure string conversion
          : '';

      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: Number(product.price) || 0,
        categoryId: product.category_id || '',
        image: product.image_url || '/placeholder.svg',
        images: product.image_url ? [product.image_url] : ['/placeholder.svg'],
        category: categoryName,
        stock: product.stock_quantity || 0,
        featured: product.featured !== undefined ? Boolean(product.featured) : false,
        colors: Array.isArray(product.colors) ? product.colors as string[] : [],
        specifications: typeof product.specifications === 'object' && product.specifications !== null 
          ? product.specifications as Record<string, string> 
          : {},
        mediaGallery: Array.isArray(product.media_gallery) 
          ? product.media_gallery as { url: string; type: 'image' | 'video' }[] 
          : []
      } as Product;
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    if (isRlsPolicyError(error)) {
      // Return fallback products
      return getFallbackProducts();
    }
    throw error;
  }
};
