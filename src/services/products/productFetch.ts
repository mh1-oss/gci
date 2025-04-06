
import { supabase } from "@/integrations/supabase/client";
import type { Product as InitialDataProduct } from '@/data/initialData';
import { mapDbProductToProduct } from '@/utils/models/productMappers';
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
