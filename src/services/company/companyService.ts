
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { CompanyInfo } from '@/data/initialData';
import { Json } from "@/integrations/supabase/types";

// Helper function to safely extract contact information from JSON
const extractContactInfo = (contactData: Json | null): CompanyInfo['contact'] => {
  // Default contact object
  const defaultContact = {
    address: '',
    phone: '',
    email: '',
    socialMedia: {}
  };

  if (!contactData) {
    return defaultContact;
  }

  // Handle string JSON data (needs parsing)
  if (typeof contactData === 'string') {
    try {
      const parsed = JSON.parse(contactData);
      return {
        address: typeof parsed.address === 'string' ? parsed.address : '',
        phone: typeof parsed.phone === 'string' ? parsed.phone : '',
        email: typeof parsed.email === 'string' ? parsed.email : '',
        socialMedia: typeof parsed.socialMedia === 'object' && parsed.socialMedia ? parsed.socialMedia : {}
      };
    } catch (err) {
      console.error('Error parsing contact JSON:', err);
      return defaultContact;
    }
  }

  // Handle object JSON data
  if (typeof contactData === 'object' && !Array.isArray(contactData)) {
    // Type guard for object type
    const objData = contactData as { [key: string]: Json | undefined };
    
    return {
      address: typeof objData.address === 'string' ? objData.address : '',
      phone: typeof objData.phone === 'string' ? objData.phone : '',
      email: typeof objData.email === 'string' ? objData.email : '',
      socialMedia: typeof objData.socialMedia === 'object' && objData.socialMedia && !Array.isArray(objData.socialMedia) 
        ? objData.socialMedia as Record<string, string> 
        : {}
    };
  }

  // If it's an array or other unsupported type, return default
  return defaultContact;
};

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

    // Use the helper function to safely extract contact information
    const contactInfo = extractContactInfo(data.contact);

    // Map the data to the CompanyInfo type
    return {
      name: data.name,
      slogan: data.slogan || '',
      about: data.about || '',
      logo: data.logo_url || '',
      contact: contactInfo,
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
      // Create a properly structured contact object for the database
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
