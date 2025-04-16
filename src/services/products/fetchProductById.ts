
import { supabase } from "@/integrations/supabase/client";
import type { Product as InitialDataProduct } from '@/data/initialData';
import { isRlsPolicyError, createRlsError } from '@/services/rls/rlsErrorHandler';
import { getFallbackProductById, mapDbToInitialDataProduct } from './utils/productUtils';

/**
 * Fetch a product by ID
 * Returns null if not found or if there's an error
 */
export const fetchProductById = async (id: string): Promise<InitialDataProduct | null> => {
  try {
    console.log(`Fetching product with ID: ${id}`);
    
    // First try to get from database
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Using maybeSingle instead of single to avoid errors
    
    if (error) {
      console.error('Error fetching product by id:', error);
      
      // Check if the error is related to RLS policy issues
      if (isRlsPolicyError(error)) {
        console.warn('RLS policy error detected, trying fallback data');
        // Try to find the product in the fallback data
        const fallbackProduct = getFallbackProductById(id);
        
        if (!fallbackProduct) {
          throw createRlsError('fetch');
        }
        
        return fallbackProduct;
      }
      
      throw error;
    }
    
    if (!data) {
      console.log(`No product found with ID: ${id}`);
      return null;
    }
    
    console.log("Product data fetched successfully:", data);
    
    // Map to InitialDataProduct type with proper defaults
    return mapDbToInitialDataProduct(data);
  } catch (error) {
    console.error('Unexpected error fetching product by id:', error);
    
    if (isRlsPolicyError(error)) {
      // Log specific RLS error information
      console.warn('RLS policy error in fetchProductById:', error);
      
      // Try to find the product in the fallback data
      const fallbackProduct = getFallbackProductById(id);
      if (fallbackProduct) {
        return fallbackProduct;
      }
    }
    
    throw error;
  }
};
