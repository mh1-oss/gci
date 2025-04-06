
import { supabase } from "@/integrations/supabase/client";
import type { Product as InitialDataProduct } from '@/data/initialData';
import {
  mapDbProductToProduct,
  mapProductToDbProduct,
  mapInitialDataProductToDbProduct
} from '@/utils/models/productMappers';
import { DbProduct, Product } from '@/utils/models/types';
import { products } from '@/data/initialData';

/**
 * Get fallback product data from the initial data set
 */
const getFallbackProducts = (): InitialDataProduct[] => {
  console.log('Using fallback product data');
  return products;
};

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
      if (error.message && (
        error.message.includes("infinite recursion") || 
        error.message.includes("policy for relation") ||
        error.message.includes("user_roles")
      )) {
        console.warn('RLS policy issue detected, using fallback data');
        return getFallbackProducts();
      }
      
      throw error; // Re-throw the error if it's not an RLS issue
    }
    
    console.log('Products fetched successfully:', data);
    
    return (data || []).map((item: DbProduct) => {
      const product = mapDbProductToProduct(item);
      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        categoryId: product.categoryId,
        image: product.image || '/placeholder.svg',
        featured: !!product.featured,
        colors: product.colors || [], // Add required colors property
      } as InitialDataProduct;
    });
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    return getFallbackProducts();
  }
};

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
      if (error.message && (
        error.message.includes("infinite recursion") || 
        error.message.includes("policy for relation") ||
        error.message.includes("user_roles")
      )) {
        // Try to find the product in the fallback data
        const fallbackProduct = products.find(p => p.id === id);
        return fallbackProduct || null;
      }
      
      return null;
    }
    
    if (!data) return null;
    
    const product = mapDbProductToProduct(data);
    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      categoryId: product.categoryId,
      image: product.image || '/placeholder.svg',
      featured: !!product.featured,
    } as InitialDataProduct;
  } catch (error) {
    console.error('Unexpected error fetching product by id:', error);
    
    // Try to find the product in the fallback data
    const fallbackProduct = products.find(p => p.id === id);
    return fallbackProduct || null;
  }
};

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
      if (error.message && (
        error.message.includes("infinite recursion") || 
        error.message.includes("policy for relation") ||
        error.message.includes("user_roles")
      )) {
        console.warn('RLS policy issue detected, filtering fallback data by category');
        return products
          .filter(p => p.categoryId === categoryId)
          .map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            image: p.image || '/placeholder.svg',
            price: p.price,
            categoryId: p.categoryId,
            featured: !!p.featured,
          } as Product));
      }
      
      throw error; // Re-throw if not RLS related
    }
    
    return (data || []).map(mapDbProductToProduct);
  } catch (error) {
    console.error('Unexpected error fetching products by category:', error);
    
    // Fallback to filtered initial data
    return products
      .filter(p => p.categoryId === categoryId)
      .map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        image: p.image || '/placeholder.svg',
        price: p.price, 
        categoryId: p.categoryId,
        featured: !!p.featured,
      } as Product));
  }
};

/**
 * Fetch featured products
 */
export const fetchFeaturedProducts = async (): Promise<InitialDataProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(4);
    
    if (error) {
      console.error('Error fetching featured products:', error);
      
      // Check if the error is related to RLS policy issues
      if (error.message && (
        error.message.includes("infinite recursion") || 
        error.message.includes("policy for relation") ||
        error.message.includes("user_roles")
      )) {
        // Filter featured products from initial data
        return products.filter(p => p.featured).slice(0, 4);
      }
      
      throw error;
    }
    
    return (data || []).map((item: DbProduct) => {
      const product = mapDbProductToProduct(item);
      return {
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        categoryId: product.categoryId,
        image: product.image || '/placeholder.svg',
        featured: true,
      } as InitialDataProduct;
    });
  } catch (error) {
    console.error('Unexpected error fetching featured products:', error);
    // Return featured products from initial data
    return products.filter(p => p.featured).slice(0, 4);
  }
};

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
    
    // Fixed: Use direct mapping without relying on mapProductToDbProduct to avoid infinite type recursion
    const dbProduct = {
      name: product.name,
      description: product.description || '',
      category_id: product.categoryId || null,
      price: product.price,
      cost_price: product.price * 0.7, // Default cost to 70% of price if not specified
      stock_quantity: product.stock || 0,
      image_url: product.image !== '/placeholder.svg' ? product.image : null,
      colors: product.colors || [],
      specifications: product.specifications || {},
      media_gallery: product.mediaGallery || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
    
    return mapDbProductToProduct(data as DbProduct);
  } catch (error) {
    console.error('Unexpected error creating product:', error);
    throw error;
  }
};

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
      if (fetchError.message && (
        fetchError.message.includes("infinite recursion") || 
        fetchError.message.includes("policy for relation") ||
        fetchError.message.includes("user_roles")
      )) {
        console.warn('RLS policy issue detected during update operation');
        throw new Error("مشكلة في سياسات قاعدة البيانات. لا يمكن تحديث المنتج حالياً");
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
      if (error.message && (
        error.message.includes("infinite recursion") || 
        error.message.includes("policy for relation") ||
        error.message.includes("user_roles")
      )) {
        console.warn('RLS policy issue detected during update operation');
        throw new Error("مشكلة في سياسات قاعدة البيانات. لا يمكن تحديث المنتج حالياً");
      }
      
      console.error('Error updating product:', error);
      throw new Error(`فشلت عملية تحديث المنتج: ${error.message}`);
    }
    
    console.log('Product updated successfully:', data);
    
    return mapDbProductToProduct(data as DbProduct);
  } catch (error) {
    console.error('Unexpected error updating product:', error);
    throw error instanceof Error ? error : new Error('فشلت عملية تحديث المنتج لسبب غير معروف');
  }
};

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
