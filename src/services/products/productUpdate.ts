
import { supabase } from "@/integrations/supabase/client";
import { mapDbProductToProduct, mapProductToDbProduct } from '@/utils/models/productMappers';
import { DbProduct, Product } from '@/utils/models/types';
import { isRlsPolicyError, createRlsError } from '@/services/rls/rlsErrorHandler';

/**
 * Update an existing product
 * Returns the updated product or null if not found or if there's an error
 */
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  try {
    console.log('Updating product with ID:', id);
    console.log('Update data:', updates);
    
    // Check connection and if product exists
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      // Check for RLS policy issues
      if (isRlsPolicyError(fetchError)) {
        console.warn('RLS policy issue detected during update operation');
        throw createRlsError('update');
      }
      
      console.error('Error fetching current product for update:', fetchError);
      return null;
    }
    
    if (!currentProduct) {
      console.error('Product not found for update:', id);
      return null;
    }
    
    const dbUpdates: Partial<DbProduct> = {};
    
    // Map product fields to database fields
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.stock !== undefined) dbUpdates.stock_quantity = updates.stock;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
    if (updates.specifications !== undefined) dbUpdates.specifications = updates.specifications;
    if (updates.mediaGallery !== undefined) dbUpdates.media_gallery = updates.mediaGallery;
    
    if (updates.image !== undefined && updates.image !== '/placeholder.svg') {
      dbUpdates.image_url = updates.image;
    }
    
    console.log('Converted to DB format for update:', dbUpdates);
    
    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      // Check for RLS policy issues
      if (isRlsPolicyError(error)) {
        console.warn('RLS policy issue detected during update operation');
        throw createRlsError('update');
      }
      
      console.error('Error updating product:', error);
      throw new Error(`فشلت عملية تحديث المنتج: ${error.message}`);
    }
    
    console.log('Product updated successfully:', data);
    
    return mapDbProductToProduct(data as DbProduct);
  } catch (error) {
    console.error('Unexpected error updating product:', error);
    throw error;
  }
};
