import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Product as InitialDataProduct } from '@/data/initialData';
import {
  mapDbProductToProduct,
  mapProductToDbProduct,
  mapInitialDataProductToDbProduct
} from '@/utils/models/productMappers';
import { DbProduct, Product } from '@/utils/models/types';

// Products
export const fetchProducts = async (): Promise<InitialDataProduct[]> => {
  try {
    console.log('Fetching products...');
    
    // Get the products without using relationships to avoid RLS issues
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    console.log('Products fetched successfully:', data);
    
    // Map products and get categories in a separate step if needed
    return (data || []).map((item: DbProduct) => {
      const product = mapDbProductToProduct(item);
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        image: product.image,
        featured: product.featured,
      } as InitialDataProduct;
    });
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<InitialDataProduct | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product by id:', error);
      return null;
    }
    
    if (!data) return null;
    
    const product = mapDbProductToProduct(data);
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      image: product.image,
      featured: product.featured,
    } as InitialDataProduct;
  } catch (error) {
    console.error('Unexpected error fetching product by id:', error);
    return null;
  }
};

export const fetchProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId);
    
    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }
    
    return (data || []).map(mapDbProductToProduct);
  } catch (error) {
    console.error('Unexpected error fetching products by category:', error);
    return [];
  }
};

export const fetchFeaturedProducts = async (): Promise<InitialDataProduct[]> => {
  try {
    // Get featured products directly without joins
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);
    
    if (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
    
    return (data || []).map((item: DbProduct) => {
      const product = mapDbProductToProduct(item);
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        image: product.image,
        featured: true,
      } as InitialDataProduct;
    });
  } catch (error) {
    console.error('Unexpected error fetching featured products:', error);
    return [];
  }
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  try {
    console.log('Creating product with data:', product);
    
    // Check if we have an active connection to Supabase with a simple query instead of count
    const { data: connectionCheck, error: connectionError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
      
    if (connectionError) {
      console.error('Connection error with Supabase:', connectionError);
      throw new Error(`Database connection error: ${connectionError.message}`);
    }
    
    // Convert to database model format
    const dbProduct = mapInitialDataProductToDbProduct(product);
    
    console.log('Converted to DB format:', dbProduct);
    
    // Insert the product into the database
    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
    
    console.log('Product created successfully:', data);
    
    return mapDbProductToProduct(data as DbProduct);
  } catch (error) {
    console.error('Unexpected error creating product:', error);
    throw error; // Re-throw to allow component-level handling
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  try {
    console.log('Updating product with ID:', id);
    console.log('Update data:', updates);
    
    // Get the current product first
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching current product for update:', fetchError);
      return null;
    }
    
    // Convert updates to database model format
    const dbUpdates: Partial<DbProduct> = {};
    
    // Only include fields that are actually being updated
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.stock !== undefined) dbUpdates.stock_quantity = updates.stock;
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured;
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
    if (updates.specifications !== undefined) dbUpdates.specifications = updates.specifications;
    if (updates.mediaGallery !== undefined) dbUpdates.media_gallery = updates.mediaGallery;
    
    // Handle image specifically to prevent overwriting with placeholder
    if (updates.image !== undefined && updates.image !== '/placeholder.svg') {
      dbUpdates.image_url = updates.image;
    }
    
    console.log('Converted to DB format for update:', dbUpdates);
    
    // Update the product in the database
    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      return null;
    }
    
    console.log('Product updated successfully:', data);
    
    return mapDbProductToProduct(data as DbProduct);
  } catch (error) {
    console.error('Unexpected error updating product:', error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting product with ID:', id);
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      return false;
    }
    
    console.log('Product deleted successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    return false;
  }
};
