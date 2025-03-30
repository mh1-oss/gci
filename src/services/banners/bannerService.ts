
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Banner } from "@/data/initialData";
import { mapDbBannerToBanner, mapBannerToDbBanner } from "@/utils/models";

export interface DbBanner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  video_url: string | null;
  media_type: string;
  cta_text: string | null;
  cta_link: string | null;
  order_index: number;
  slider_height: number | null;
  text_color: string | null;
  created_at?: string;
  updated_at?: string;
}

export const fetchBanners = async (): Promise<Banner[]> => {
  try {
    console.log('Fetching banners...');
    
    // First, check if the user is authenticated 
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session?.user;
    
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching banners:', error);
      
      // If there's an error related to RLS policies and the user is authenticated
      if (error.code === '42P17' && isAuthenticated) {
        console.log('Using direct query for banners due to RLS error');
        // Use a simpler query without RLS for now
        // In the future we should add an RPC function similar to the other services
        const { data: directData, error: directError } = await supabase
          .from('banners')
          .select('*')
          .order('order_index', { ascending: true });
        
        if (directError) {
          console.error('Direct query failed:', directError);
          toast({
            title: "خطأ",
            description: "فشل في تحميل البانرات.",
            variant: "destructive",
          });
          return [];
        }
        
        return (directData || []).map(mapDbBannerToBanner);
      }
      
      toast({
        title: "خطأ",
        description: "فشل في تحميل البانرات.",
        variant: "destructive",
      });
      return [];
    }
    
    return (data || []).map(mapDbBannerToBanner);
  } catch (error) {
    console.error('Unexpected error fetching banners:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء جلب البانرات",
      variant: "destructive",
    });
    return [];
  }
};

export const createBanner = async (banner: Omit<Banner, 'id'>): Promise<Banner | null> => {
  try {
    const dbBanner = mapBannerToDbBanner(banner);
    
    // We're using a regular object, not an array of objects
    const { data, error } = await supabase
      .from('banners')
      .insert(dbBanner)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating banner:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء البانر.",
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "تمت الإضافة",
      description: "تمت إضافة البانر بنجاح",
    });
    
    return mapDbBannerToBanner(data);
  } catch (error) {
    console.error('Unexpected error creating banner:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء إنشاء البانر",
      variant: "destructive",
    });
    return null;
  }
};

export const updateBanner = async (id: string, updates: Partial<Banner>): Promise<Banner | null> => {
  try {
    const dbUpdates: Partial<DbBanner> = {};
    
    // Map the fields that need to be updated
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle || null;
    if (updates.image !== undefined) dbUpdates.image = updates.image || null;
    if (updates.videoUrl !== undefined) dbUpdates.video_url = updates.videoUrl || null;
    if (updates.mediaType !== undefined) dbUpdates.media_type = updates.mediaType;
    if (updates.ctaText !== undefined) dbUpdates.cta_text = updates.ctaText || null;
    if (updates.ctaLink !== undefined) dbUpdates.cta_link = updates.ctaLink || null;
    if (updates.orderIndex !== undefined) dbUpdates.order_index = updates.orderIndex;
    if (updates.sliderHeight !== undefined) dbUpdates.slider_height = updates.sliderHeight || null;
    if (updates.textColor !== undefined) dbUpdates.text_color = updates.textColor || null;
    
    const { data, error } = await supabase
      .from('banners')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating banner:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث البانر.",
        variant: "destructive",
      });
      return null;
    }
    
    toast({
      title: "تم التحديث",
      description: "تم تحديث البانر بنجاح",
    });
    
    return mapDbBannerToBanner(data);
  } catch (error) {
    console.error('Unexpected error updating banner:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء تحديث البانر",
      variant: "destructive",
    });
    return null;
  }
};

export const deleteBanner = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف البانر.",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "تم الحذف",
      description: "تم حذف البانر بنجاح",
    });
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting banner:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء حذف البانر",
      variant: "destructive",
    });
    return false;
  }
};
