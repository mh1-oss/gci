
import { supabase } from "@/integrations/supabase/client";
import { Product } from '@/utils/models/types';
import { products } from '@/data/initialData';
import { isRlsPolicyError, mapDbToProduct, mapInitialToProduct } from './utils/productUtils';

/**
 * Fetch products by category ID
 */
export const fetchProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId);
    
    if (error) {
      console.error('Error fetching products by category:', error);
      
      // Check if the error is related to RLS policy issues
      if (isRlsPolicyError(error)) {
        console.warn('RLS policy issue detected, filtering fallback data by category');
        // Map filtered initial data to Product type
        return products
          .filter(p => p.categoryId === categoryId)
          .map(mapInitialToProduct);
      }
      
      throw error; // Re-throw if not RLS related
    }
    
    // Map database results to Product type with proper defaults
    return (data || []).map(mapDbToProduct);
  } catch (error) {
    console.error('Unexpected error fetching products by category:', error);
    
    // Fallback to filtered initial data
    return products
      .filter(p => p.categoryId === categoryId)
      .map(mapInitialToProduct);
  }
};
