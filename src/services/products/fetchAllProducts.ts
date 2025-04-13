
import { supabase } from "@/integrations/supabase/client";
import type { Product as InitialDataProduct } from '@/data/initialData';
import { isRlsPolicyError, getFallbackProducts, mapDbToInitialDataProduct } from './utils/productUtils';

/**
 * Fetch all products from the database
 * Falls back to initial data if there's an RLS policy issue
 */
export const fetchProducts = async (): Promise<InitialDataProduct[]> => {
  try {
    console.log('Fetching products...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
      
      // Check if the error is related to RLS policy issues
      if (isRlsPolicyError(error)) {
        console.warn('RLS policy issue detected, using fallback data');
        return getFallbackProducts();
      }
      
      throw error; // Re-throw the error if it's not an RLS issue
    }
    
    console.log('Products fetched successfully:', data);
    
    // Map database results to InitialDataProduct type with proper defaults
    return (data || []).map(mapDbToInitialDataProduct);
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    return getFallbackProducts();
  }
};
