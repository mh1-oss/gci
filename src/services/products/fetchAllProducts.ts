
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
        // Convert fallback data to match Product type from utils/models/types
        return getFallbackProducts().map(product => ({
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: Number(product.price) || 0,
          categoryId: product.categoryId || '',
          image: product.image || '/placeholder.svg',
          images: product.image ? [product.image] : ['/placeholder.svg'],
          category: '',
          stock: 0,
          featured: product.featured || false,
          colors: product.colors || [],
          specifications: product.specifications || {},
          mediaGallery: product.mediaGallery || []
        }));
      }
      
      console.error('Error fetching products:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No products found in database, using fallback data');
      // Convert fallback data to match Product type from utils/models/types
      return getFallbackProducts().map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: Number(product.price) || 0,
        categoryId: product.categoryId || '',
        image: product.image || '/placeholder.svg',
        images: product.image ? [product.image] : ['/placeholder.svg'],
        category: '',
        stock: 0,
        featured: product.featured || false,
        colors: product.colors || [],
        specifications: product.specifications || {},
        mediaGallery: product.mediaGallery || []
      }));
    }
    
    // Map DB products to frontend Product type
    return data.map(product => {
      // Handle the possibility of categories being null safely
      const categoryName = 
        product.categories && 
        typeof product.categories === 'object' && 
        product.categories !== null && 
        'name' in product.categories
          ? product.categories.name as string
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
        featured: Boolean(product.featured) || false,
        colors: Array.isArray(product.colors) ? product.colors : [],
        specifications: typeof product.specifications === 'object' && product.specifications !== null ? product.specifications : {},
        mediaGallery: Array.isArray(product.media_gallery) ? product.media_gallery : []
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    if (isRlsPolicyError(error)) {
      // Convert fallback data to match Product type from utils/models/types
      return getFallbackProducts().map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: Number(product.price) || 0,
        categoryId: product.categoryId || '',
        image: product.image || '/placeholder.svg',
        images: product.image ? [product.image] : ['/placeholder.svg'],
        category: '',
        stock: 0,
        featured: product.featured || false,
        colors: product.colors || [],
        specifications: product.specifications || {},
        mediaGallery: product.mediaGallery || []
      }));
    }
    throw error;
  }
};
