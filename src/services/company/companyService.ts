
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { CompanyInfo } from '@/data/initialData';
import {
  mapDbCompanyInfoToCompanyInfo,
  mapCompanyInfoToDbCompanyInfo
} from '@/utils/modelMappers';

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
