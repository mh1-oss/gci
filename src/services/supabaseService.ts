
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { 
  Product, 
  Category,
  Banner,
  CompanyInfo,
  MediaItem
} from '@/data/initialData';
import {
  mapDbProductToProduct,
  mapProductToDbProduct,
  mapDbCategoryToCategory,
  mapCategoryToDbCategory,
  mapDbCompanyInfoToCompanyInfo,
  mapCompanyInfoToDbCompanyInfo,
  DbProduct,
  DbCategory,
  DbCompanyInfo
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

// Categories
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    // Use anon key for public access to categories
    const { data, error } = await supabase
      .from('categories')
      .select('*');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return (data || []).map(mapDbCategoryToCategory);
  } catch (error) {
    console.error('Unexpected error fetching categories:', error);
    return [];
  }
};

export const fetchCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching category by id:', error);
      return null;
    }
    
    return data ? mapDbCategoryToCategory(data) : null;
  } catch (error) {
    console.error('Unexpected error fetching category by id:', error);
    return null;
  }
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category | null> => {
  try {
    const dbCategory = mapCategoryToDbCategory(category);
    
    // First check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        title: "خطأ في التحقق",
        description: "يجب تسجيل الدخول لإنشاء فئة جديدة",
        variant: "destructive",
      });
      return null;
    }
    
    const { data, error } = await supabase
      .from('categories')
      .insert([dbCategory])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      if (error.message.includes('permission denied')) {
        toast({
          title: "خطأ في الصلاحيات",
          description: "ليس لديك صلاحية لإنشاء فئة جديدة",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ في إنشاء الفئة",
          description: error.message,
          variant: "destructive",
        });
      }
      return null;
    }
    
    toast({
      title: "تم بنجاح",
      description: "تم إضافة الفئة بنجاح",
    });
    
    return mapDbCategoryToCategory(data);
  } catch (error) {
    console.error('Unexpected error creating category:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء إنشاء الفئة",
      variant: "destructive",
    });
    return null;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | null> => {
  try {
    // First check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        title: "خطأ في التحقق",
        description: "يجب تسجيل الدخول لتحديث الفئة",
        variant: "destructive",
      });
      return null;
    }
    
    // Convert to database model format
    const dbUpdates: Partial<DbCategory> = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    
    const { data, error } = await supabase
      .from('categories')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating category:', error);
      if (error.message.includes('permission denied')) {
        toast({
          title: "خطأ في الصلاحيات",
          description: "ليس لديك صلاحية لتحديث الفئة",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ في تحديث الفئة",
          description: error.message,
          variant: "destructive",
        });
      }
      return null;
    }
    
    toast({
      title: "تم بنجاح",
      description: "تم تحديث الفئة بنجاح",
    });
    
    return mapDbCategoryToCategory(data);
  } catch (error) {
    console.error('Unexpected error updating category:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء تحديث الفئة",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    // First check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        title: "خطأ في التحقق",
        description: "يجب تسجيل الدخول لحذف الفئة",
        variant: "destructive",
      });
      return false;
    }
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting category:', error);
      if (error.message.includes('permission denied')) {
        toast({
          title: "خطأ في الصلاحيات",
          description: "ليس لديك صلاحية لحذف الفئة",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ في حذف الفئة",
          description: error.message,
          variant: "destructive",
        });
      }
      return false;
    }
    
    toast({
      title: "تم بنجاح",
      description: "تم حذف الفئة بنجاح",
    });
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting category:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء حذف الفئة",
      variant: "destructive",
    });
    return false;
  }
};

// Company Info
export const fetchCompanyInfo = async (): Promise<CompanyInfo | null> => {
  try {
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.error('Error fetching company info:', error);
      return null;
    }
    
    return data ? mapDbCompanyInfoToCompanyInfo(data) : null;
  } catch (error) {
    console.error('Unexpected error fetching company info:', error);
    return null;
  }
};

export const updateCompanyInfo = async (updates: Partial<CompanyInfo>): Promise<CompanyInfo | null> => {
  try {
    const dbUpdates = mapCompanyInfoToDbCompanyInfo(updates);
    
    const { data, error } = await supabase
      .from('company_info')
      .update(dbUpdates)
      .eq('id', 1)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating company info:', error);
      toast({
        title: "خطأ في تحديث معلومات الشركة",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "تم بنجاح",
      description: "تم تحديث معلومات الشركة بنجاح",
    });
    
    return data ? mapDbCompanyInfoToCompanyInfo(data) : null;
  } catch (error) {
    console.error('Unexpected error updating company info:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء تحديث معلومات الشركة",
      variant: "destructive",
    });
    return null;
  }
};

// Media Upload
export const uploadMedia = async (file: File): Promise<string | null> => {
  try {
    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const filePath = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
    
    // First create a storage bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('media');
    
    if (bucketError && bucketError.message.includes('does not exist')) {
      // Bucket doesn't exist, create it
      const { error: createBucketError } = await supabase.storage.createBucket('media', {
        public: true
      });
      
      if (createBucketError) {
        console.error('Error creating storage bucket:', createBucketError);
        toast({
          title: "خطأ في تهيئة مخزن الوسائط",
          description: createBucketError.message,
          variant: "destructive",
        });
        return null;
      }
    }
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast({
        title: "خطأ في رفع الملف",
        description: uploadError.message,
        variant: "destructive",
      });
      return null;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    toast({
      title: "تم بنجاح",
      description: "تم رفع الملف بنجاح",
    });
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading file:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء رفع الملف",
      variant: "destructive",
    });
    return null;
  }
};

// Auth functions
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }
    
    // Try using a direct query to check for admin role instead of using RPC
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
    
    return data !== null;
  } catch (error) {
    console.error('Unexpected error checking admin role:', error);
    return false;
  }
};
