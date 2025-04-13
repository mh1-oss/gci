
import { supabase } from "@/integrations/supabase/client";
import { Product } from '@/utils/models/types';

/**
 * Create a new product
 * Returns the created product or throws an error
 */
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  try {
    console.log('Creating product with data:', product);
    
    // Check database connection first
    const { data: connectionCheck, error: connectionError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
      
    if (connectionError) {
      // If we have an RLS-related error, handle it gracefully
      if (connectionError.message && (
        connectionError.message.includes("infinite recursion") || 
        connectionError.message.includes("policy for relation") ||
        connectionError.message.includes("user_roles")
      )) {
        console.warn('RLS policy issue detected during create operation');
        throw new Error("مشكلة في سياسات قاعدة البيانات. لا يمكن إنشاء المنتج حالياً");
      }
      
      console.error('Connection error with Supabase:', connectionError);
      throw new Error(`خطأ في الاتصال بقاعدة البيانات: ${connectionError.message}`);
    }
    
    // Create the database product object directly
    const dbProduct = {
      name: product.name,
      description: product.description || '',
      category_id: product.categoryId || null,
      price: product.price,
      cost_price: product.price * 0.7, // Default cost to 70% of price if not specified
      stock_quantity: product.stock || 0,
      image_url: product.image !== '/placeholder.svg' ? product.image : null
    };
    
    console.log('Converted to DB format:', dbProduct);
    
    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw new Error(`فشلت عملية إنشاء المنتج: ${error.message}`);
    }
    
    console.log('Product created successfully:', data);
    
    // Map to the Product type with defaults for missing fields
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: Number(data.price) || 0,
      categoryId: data.category_id || '',
      image: data.image_url || '/placeholder.svg',
      featured: false, // Default since it's not in DB schema
      images: data.image_url ? [data.image_url] : ['/placeholder.svg'],
      category: '',
      stock: data.stock_quantity || 0,
      colors: [], // Default since it's not in DB schema
      specifications: {}, // Default since it's not in DB schema
      mediaGallery: [] // Default since it's not in DB schema
    };
  } catch (error) {
    console.error('Unexpected error creating product:', error);
    throw error;
  }
};
