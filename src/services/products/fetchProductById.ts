
import { supabase } from "@/integrations/supabase/client";
import type { Product as InitialDataProduct } from '@/data/initialData';
import { isRlsPolicyError, getFallbackProductById, mapDbToInitialDataProduct } from './utils/productUtils';

/**
 * Fetch a product by ID
 * Returns null if not found or if there's an error
 */
export const fetchProductById = async (id: string): Promise<InitialDataProduct | null> => {
  try {
    // First try to get from database
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product by id:', error);
      
      // Check if the error is related to RLS policy issues
      if (isRlsPolicyError(error)) {
        // Try to find the product in the fallback data
        return getFallbackProductById(id);
      }
      
      return null;
    }
    
    if (!data) return null;
    
    // Map to InitialDataProduct type with proper defaults
    return mapDbToInitialDataProduct(data);
  } catch (error) {
    console.error('Unexpected error fetching product by id:', error);
    
    // Try to find the product in the fallback data
    return getFallbackProductById(id);
  }
};
