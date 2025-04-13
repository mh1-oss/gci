
import { supabase } from "@/integrations/supabase/client";
import type { Product as InitialDataProduct } from '@/data/initialData';
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
    
    // Map database results to InitialDataProduct type with proper defaults
    return (data || []).map((item: any): InitialDataProduct => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: Number(item.price) || 0,
      categoryId: item.category_id || '',
      image: item.image_url || '/placeholder.svg',
      featured: false, // Default since it's not in DB schema
      colors: [] // Default since it's not in DB schema
    }));
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
    
    // Map to InitialDataProduct type with proper defaults
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: Number(data.price) || 0,
      categoryId: data.category_id || '',
      image: data.image_url || '/placeholder.svg',
      featured: false, // Default since it's not in DB schema
      colors: [] // Default since it's not in DB schema
    };
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
        // Map filtered initial data to Product type
        return products
          .filter(p => p.categoryId === categoryId)
          .map((p): Product => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            image: p.image || '/placeholder.svg',
            price: p.price,
            categoryId: p.categoryId,
            featured: !!p.featured,
            images: [p.image || '/placeholder.svg'],
            category: '',
            stock: 0,
            colors: p.colors || [],
            specifications: p.specifications || {},
            mediaGallery: p.mediaGallery || []
          }));
      }
      
      throw error; // Re-throw if not RLS related
    }
    
    // Map database results to Product type with proper defaults
    return (data || []).map((item: any): Product => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      image: item.image_url || '/placeholder.svg',
      price: Number(item.price) || 0,
      categoryId: item.category_id || '',
      featured: false, // Default since it's not in DB schema
      images: item.image_url ? [item.image_url] : ['/placeholder.svg'],
      category: '',
      stock: item.stock_quantity || 0,
      colors: [], // Default since it's not in DB schema
      specifications: {}, // Default since it's not in DB schema
      mediaGallery: [] // Default since it's not in DB schema
    }));
  } catch (error) {
    console.error('Unexpected error fetching products by category:', error);
    
    // Fallback to filtered initial data
    return products
      .filter(p => p.categoryId === categoryId)
      .map((p): Product => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        image: p.image || '/placeholder.svg',
        price: p.price,
        categoryId: p.categoryId,
        featured: !!p.featured,
        images: [p.image || '/placeholder.svg'],
        category: '',
        stock: 0,
        colors: p.colors || [],
        specifications: p.specifications || {},
        mediaGallery: p.mediaGallery || []
      }));
  }
};

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
    
    // Map database results to InitialDataProduct type with proper defaults
    return (data || []).map((item: any): InitialDataProduct => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: Number(item.price) || 0,
      categoryId: item.category_id || '',
      image: item.image_url || '/placeholder.svg',
      featured: true, // We're treating these as featured since we're limiting to 4
      colors: [] // Default since it's not in DB schema
    }));
  } catch (error) {
    console.error('Unexpected error fetching featured products:', error);
    // Return featured products from initial data
    return products.filter(p => p.featured).slice(0, 4);
  }
};
