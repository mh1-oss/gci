
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
    // Try fetching products from Supabase - without using JOIN
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      if (isRlsPolicyError(productsError)) {
        console.warn('RLS policy issue detected, using fallback data');
        return getFallbackProducts();
      }
      
      console.error('Error fetching products:', productsError);
      throw productsError;
    }
    
    if (!productsData || productsData.length === 0) {
      console.log('No products found in database, using fallback data');
      return getFallbackProducts();
    }
    
    // Fetch categories separately to manually associate with products
    let categoriesMap = new Map();
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name');
        
      if (!categoriesError && categoriesData) {
        // Create a map of category id -> name for quick lookups
        categoriesData.forEach(category => {
          categoriesMap.set(category.id, category.name);
        });
      } else {
        console.warn('Error fetching categories:', categoriesError);
      }
    } catch (err) {
      console.warn('Failed to fetch categories:', err);
    }
    
    // Map DB products to frontend Product type
    return productsData.map(product => {
      // Get category name from our map if available
      const categoryName = product.category_id 
        ? categoriesMap.get(product.category_id) || ''
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
        stock_quantity: product.stock_quantity || 0,
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
