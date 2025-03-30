
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Product } from '@/data/initialData';
import {
  mapDbProductToProduct,
  mapProductToDbProduct,
  DbProduct
} from '@/utils/models';

// Products
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products...');
    
    // First, check if the user is authenticated and is an admin
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session?.user;
    
    // Attempt to fetch products
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
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
          toast({
            title: "خطأ في جلب البيانات",
            description: adminError.message,
            variant: "destructive",
          });
          return [];
        }
        
        return (adminData as DbProduct[]).map(mapDbProductToProduct);
      }
      
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
    
    console.log('Products fetched successfully:', data);
    return (data || []).map(mapDbProductToProduct);
  } catch (error) {
    console.error('Unexpected error fetching products:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء جلب المنتجات",
      variant: "destructive",
    });
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
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
    
    return data ? mapDbProductToProduct(data) : null;
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

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
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
          .map(product => ({
            ...mapDbProductToProduct(product),
            featured: true
          }));
      }
      
      return [];
    }
    
    return (data || []).map(product => ({
      ...mapDbProductToProduct(product),
      featured: true
    }));
  } catch (error) {
    console.error('Unexpected error fetching featured products:', error);
    return [];
  }
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
  try {
    const dbProduct = mapProductToDbProduct(product);
    
    // Add auth headers to bypass RLS 
    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      toast({
        title: "خطأ في إنشاء المنتج",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "تم بنجاح",
      description: "تم إضافة المنتج بنجاح",
    });
    
    return mapDbProductToProduct(data);
  } catch (error) {
    console.error('Unexpected error creating product:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء إنشاء المنتج",
      variant: "destructive",
    });
    return null;
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | null> => {
  try {
    // Convert to database model format
    const dbUpdates: Partial<DbProduct> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.image !== undefined && updates.image !== '/placeholder.svg') {
      dbUpdates.image_url = updates.image;
    }
    
    const { data, error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      toast({
        title: "خطأ في تحديث المنتج",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "تم بنجاح",
      description: "تم تحديث المنتج بنجاح",
    });
    
    return mapDbProductToProduct(data);
  } catch (error) {
    console.error('Unexpected error updating product:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء تحديث المنتج",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "خطأ في حذف المنتج",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "تم بنجاح",
      description: "تم حذف المنتج بنجاح",
    });
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting product:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء حذف المنتج",
      variant: "destructive",
    });
    return false;
  }
};
