
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Review {
  id: string;
  customer_name: string;
  position: string | null;
  content: string;
  rating: number;
  image_url?: string | null;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const fetchReviews = async (): Promise<Review[]> => {
  try {
    console.log('Fetching reviews...');
    
    // First, check if the user is authenticated and is an admin
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session?.user;
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching reviews:', error);
      
      // If there's an error related to RLS policies and the user is authenticated
      if (error.code === '42P17' && isAuthenticated) {
        console.log('Using fallback method to fetch reviews due to RLS error');
        // Use a more direct query approach without RLS interference
        const { data: adminData, error: adminError } = await supabase.rpc('get_all_reviews');
        
        if (adminError) {
          console.error('Fallback method failed:', adminError);
          toast({
            title: "خطأ",
            description: "فشل في تحميل المراجعات.",
            variant: "destructive",
          });
          return [];
        }
        
        return adminData as Review[];
      }
      
      toast({
        title: "خطأ",
        description: "فشل في تحميل المراجعات.",
        variant: "destructive",
      });
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching reviews:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء جلب المراجعات",
      variant: "destructive",
    });
    return [];
  }
};

export const createReview = async (review: Omit<Review, 'id'>): Promise<Review | null> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([review])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating review:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء المراجعة.",
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "تمت الإضافة",
      description: "تمت إضافة المراجعة بنجاح",
    });
    
    return data;
  } catch (error) {
    console.error('Unexpected error creating review:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء إنشاء المراجعة",
      variant: "destructive",
    });
    return null;
  }
};

export const updateReview = async (id: string, updates: Partial<Review>): Promise<Review | null> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating review:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث المراجعة.",
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "تم التحديث",
      description: "تم تحديث المراجعة بنجاح",
    });
    
    return data;
  } catch (error) {
    console.error('Unexpected error updating review:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء تحديث المراجعة",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteReview = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المراجعة.",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "تم الحذف",
      description: "تم حذف المراجعة بنجاح",
    });
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting review:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء حذف المراجعة",
      variant: "destructive",
    });
    return false;
  }
};
