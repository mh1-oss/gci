
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
    
    // First, check if the user is authenticated and is an admin
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session?.user;
    
    // Attempt to fetch products
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)');
    
    if (error) {
      console.error('Error fetching products:', error);
      
      // If there's an error related to RLS policies and the user is authenticated
      // This is likely due to a Supabase RLS policy issue - try to work around it
      if (error.code === '42P17' && isAuthenticated) {
        console.log('Using fallback method to fetch products due to RLS error');
        // Use a more direct query approach without RLS interference
        const { data: adminData, error: adminError } = await supabase.rpc('get_all_products');
        
        if (adminError) {
          console.error('Fallback method failed:', adminError);
          return [];
        }
        
        return (adminData as DbProduct[]).map((item) => {
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
      }
      
      return [];
    }
    
    console.log('Products fetched successfully:', data);
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
    // Attempt to fetch featured products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);
    
    if (error) {
      console.error('Error fetching featured products:', error);
      
      // If there's an error related to RLS policies, try to work around it
      const { data: session } = await supabase.auth.getSession();
      const isAuthenticated = !!session?.session?.user;
      
      if (error.code === '42P17' && isAuthenticated) {
        console.log('Using fallback method to fetch featured products due to RLS error');
        const { data: adminData, error: adminError } = await supabase.rpc('get_all_products');
        
        if (adminError) {
          console.error('Fallback method failed:', adminError);
          return [];
        }
        
        // Take the first 4 products and mark them as featured
        return (adminData as DbProduct[])
          .slice(0, 4)
          .map(dbProduct => {
            const product = mapDbProductToProduct(dbProduct);
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
      }
      
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
      return null;
    }
    
    console.log('Product created successfully:', data);
    
    return mapDbProductToProduct(data);
  } catch (error) {
    console.error('Unexpected error creating product:', error);
    return null;
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
    
    return mapDbProductToProduct(data);
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
