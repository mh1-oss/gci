
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { CompanyInfo } from '@/data/initialData';

// Company Info
export const fetchCompanyInfo = async (): Promise<CompanyInfo | null> => {
  try {
    console.log('Fetching company info...');
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.error('Error fetching company info:', error);
      return null;
    }
    
    if (!data) {
      console.log('No company info found');
      return null;
    }
    
    console.log('Raw company data:', data);

    // Parse the contact data safely
    let contactObj: any = {};
    if (data.contact) {
      try {
        if (typeof data.contact === 'string') {
          contactObj = JSON.parse(data.contact);
        } else if (typeof data.contact === 'object') {
          contactObj = data.contact;
        }
      } catch (err) {
        console.error('Error parsing contact JSON:', err);
      }
    }

    // Map the data to the CompanyInfo type
    return {
      name: data.name,
      slogan: data.slogan || '',
      about: data.about || '',
      logo: data.logo_url || '',
      contact: {
        address: contactObj?.address || '',
        phone: contactObj?.phone || '',
        email: contactObj?.email || '',
        socialMedia: contactObj?.socialMedia || {}
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
    console.log('Updating company info with:', updates);
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.slogan !== undefined) dbUpdates.slogan = updates.slogan;
    if (updates.about !== undefined) dbUpdates.about = updates.about;
    if (updates.logo !== undefined) dbUpdates.logo_url = updates.logo;
    
    if (updates.contact) {
      // Make sure contact data is an object
      dbUpdates.contact = {
        address: updates.contact.address || '',
        email: updates.contact.email || '',
        phone: updates.contact.phone || '',
        socialMedia: updates.contact.socialMedia || {}
      };
    }
    
    console.log('Database updates:', dbUpdates);
    
    const { error } = await supabase
      .from('company_info')
      .update(dbUpdates)
      .eq('id', 1);
    
    if (error) {
      console.error('Error updating company info:', error);
      return false;
    }
    
    console.log('Company info updated successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error updating company info:', error);
    return false;
  }
};
