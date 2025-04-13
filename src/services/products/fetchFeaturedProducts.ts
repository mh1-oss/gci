
import { supabase } from "@/integrations/supabase/client";
import type { Product as InitialDataProduct } from '@/data/initialData';
import { products } from '@/data/initialData';
import { isRlsPolicyError, mapDbToInitialDataProduct } from './utils/productUtils';

/**
 * Fetch featured products
 */
export const fetchFeaturedProducts = async (): Promise<InitialDataProduct[]> => {
  try {
    // Since 'featured' field doesn't exist in the DB schema,
    // we'll just get some recent products instead
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);
    
    if (error) {
      console.error('Error fetching featured products:', error);
      
      // Check if the error is related to RLS policy issues
      if (isRlsPolicyError(error)) {
        // Filter featured products from initial data
        return products.filter(p => p.featured).slice(0, 4);
      }
      
      throw error;
    }
    
    // Map database results to InitialDataProduct type with proper defaults
    return (data || []).map((item) => ({
      ...mapDbToInitialDataProduct(item),
      featured: true // We're treating these as featured since we're limiting to 4
    }));
  } catch (error) {
    console.error('Unexpected error fetching featured products:', error);
    // Return featured products from initial data
    return products.filter(p => p.featured).slice(0, 4);
  }
};
