
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Product } from '@/data/initialData';
import {
  mapDbProductToProduct,
  mapProductToDbProduct,
  DbProduct
} from '@/utils/modelMappers';

// Products
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
    
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
    // Assuming 'featured' would be a boolean column in your database
    // If not implemented yet, this could return the first 4 products as featured
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);
    
    if (error) {
      console.error('Error fetching featured products:', error);
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
