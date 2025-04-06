
import { supabase } from "@/integrations/supabase/client";

/**
 * Delete a product by ID
 * Returns true if successful, false otherwise
 */
export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting product with ID:', id);
    
    // Check if product exists first
    const { data: productExists, error: checkError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      // Check for RLS policy issues
      if (checkError.message && (
        checkError.message.includes("infinite recursion") || 
        checkError.message.includes("policy for relation") ||
        checkError.message.includes("user_roles")
      )) {
        console.warn('RLS policy issue detected during delete operation');
        throw new Error("مشكلة في سياسات قاعدة البيانات. لا يمكن حذف المنتج حالياً");
      }
      
      if (checkError.code === 'PGRST116') {
        console.warn('Product not found for deletion:', id);
        return false;
      }
      
      console.error('Error checking product before deletion:', checkError);
      throw new Error(`خطأ في التحقق من وجود المنتج: ${checkError.message}`);
    }
    
    if (!productExists) {
      console.warn('Product not found for deletion:', id);
      return false;
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      // Check for RLS policy issues
      if (error.message && (
        error.message.includes("infinite recursion") || 
        error.message.includes("policy for relation") ||
        error.message.includes("user_roles")
      )) {
        console.warn('RLS policy issue detected during delete operation');
        throw new Error("مشكلة في سياسات قاعدة البيانات. لا يمكن حذف المنتج حالياً");
      }
      
      console.error('Error deleting product:', error);
      throw new Error(`فشلت عملية حذف المنتج: ${error.message}`);
    }
    
    console.log('Product deleted successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    throw error instanceof Error ? error : new Error('فشلت عملية حذف المنتج لسبب غير معروف');
  }
};
