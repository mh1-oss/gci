
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
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
    
    if (!data) return null;

    // Map the data to the CompanyInfo type
    return {
      name: data.name,
      slogan: data.slogan || '',
      about: data.about || '',
      logo: data.logo_url || '',
      contact: {
        address: typeof data.contact === 'object' && data.contact ? (data.contact as any).address || '' : '',
        phone: typeof data.contact === 'object' && data.contact ? (data.contact as any).phone || '' : '',
        email: typeof data.contact === 'object' && data.contact ? (data.contact as any).email || '' : '',
        socialMedia: typeof data.contact === 'object' && data.contact && (data.contact as any).socialMedia 
          ? (data.contact as any).socialMedia 
          : {}
      },
      exchangeRate: 1
    };
  } catch (error) {
    console.error('Unexpected error fetching company info:', error);
    return null;
  }
};

export const updateCompanyInfo = async (updates: Partial<CompanyInfo>): Promise<boolean> => {
  try {
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.slogan !== undefined) dbUpdates.slogan = updates.slogan;
    if (updates.about !== undefined) dbUpdates.about = updates.about;
    if (updates.logo !== undefined) dbUpdates.logo_url = updates.logo;
    
    if (updates.contact) {
      dbUpdates.contact = {
        address: updates.contact.address || '',
        email: updates.contact.email || '',
        phone: updates.contact.phone || '',
        socialMedia: updates.contact.socialMedia || {}
      };
    }
    
    const { error } = await supabase
      .from('company_info')
      .update(dbUpdates)
      .eq('id', 1);
    
    if (error) {
      console.error('Error updating company info:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error updating company info:', error);
    return false;
  }
};
