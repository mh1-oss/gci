
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Category } from '@/data/initialData';
import {
  mapDbCategoryToCategory,
  mapCategoryToDbCategory,
  DbCategory
} from '@/utils/modelMappers';

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
    
    // First check if user is authenticated via the auth status
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        title: "خطأ في التحقق",
        description: "يجب تسجيل الدخول لإنشاء فئة جديدة",
        variant: "destructive",
      });
      return null;
    }
    
    // Check if user is admin using RPC function
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin');
    if (adminCheckError || !isAdmin) {
      console.error('Error checking admin status:', adminCheckError);
      toast({
        title: "خطأ في الصلاحيات",
        description: "ليس لديك صلاحية لإنشاء فئة جديدة",
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
      toast({
        title: "خطأ في إنشاء الفئة",
        description: error.message,
        variant: "destructive",
      });
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
    
    // Check if user is admin using RPC function
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin');
    if (adminCheckError || !isAdmin) {
      console.error('Error checking admin status:', adminCheckError);
      toast({
        title: "خطأ في الصلاحيات",
        description: "ليس لديك صلاحية لتحديث الفئة",
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
      toast({
        title: "خطأ في تحديث الفئة",
        description: error.message,
        variant: "destructive",
      });
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
    
    // Check if user is admin using RPC function
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin');
    if (adminCheckError || !isAdmin) {
      console.error('Error checking admin status:', adminCheckError);
      toast({
        title: "خطأ في الصلاحيات",
        description: "ليس لديك صلاحية لحذف الفئة",
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
      toast({
        title: "خطأ في حذف الفئة",
        description: error.message,
        variant: "destructive",
      });
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
