
import { supabase } from "@/integrations/supabase/client";
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
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return defaultContact;
      }
      
      return {
        address: typeof parsed.address === 'string' ? parsed.address : '',
        phone: typeof parsed.phone === 'string' ? parsed.phone : '',
        email: typeof parsed.email === 'string' ? parsed.email : '',
        socialMedia: typeof parsed.socialMedia === 'object' && parsed.socialMedia !== null && !Array.isArray(parsed.socialMedia) 
          ? parsed.socialMedia as Record<string, string> 
          : {}
      };
    } catch (err) {
      console.error('Error parsing contact JSON:', err);
      return defaultContact;
    }
  }

  // Handle object JSON data with proper type checking
  if (typeof contactData === 'object' && !Array.isArray(contactData)) {
    // Explicitly cast to object with string keys
    const objData = contactData as Record<string, Json>;
    
    return {
      address: typeof objData.address === 'string' ? objData.address : '',
      phone: typeof objData.phone === 'string' ? objData.phone : '',
      email: typeof objData.email === 'string' ? objData.email : '',
      socialMedia: typeof objData.socialMedia === 'object' && objData.socialMedia !== null && !Array.isArray(objData.socialMedia) 
        ? objData.socialMedia as Record<string, string>
        : {}
    };
  }

  // If it's an array or other unsupported type, return default
  return defaultContact;
};

// Type for the company_info record from RPC function
interface CompanyInfoRecord {
  id: number;
  name: string;
  slogan: string | null;
  about: string | null;
  logo_url: string | null;
  contact: Json | null;
  created_at: string;
  updated_at: string;
  // Add any other fields from the company_info table
  features_title: string | null;
  features_description: string | null;
  reviews_title: string | null;
  reviews_description: string | null;
  slider_timing: number | null;
}

// Company Info
export const fetchCompanyInfo = async (): Promise<CompanyInfo | null> => {
  try {
    console.log('Fetching company info...');
    
    // First, check if the user is authenticated and is an admin
    const { data: session } = await supabase.auth.getSession();
    const isAuthenticated = !!session?.session?.user;
    
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.error('Error fetching company info:', error);
      
      // If there's an error related to RLS policies and the user is authenticated
      if (error.code === '42P17' && isAuthenticated) {
        console.log('Using fallback method to fetch company info due to RLS error');
        // Use a more direct query approach without RLS interference
        const { data: adminData, error: adminError } = await supabase.rpc('get_company_info');
        
        if (adminError) {
          console.error('Fallback method failed:', adminError);
          return {
            name: 'شركة الذهبية للصناعات الكيمياوية',
            slogan: 'جودة تدوم مع الوقت',
            about: '',
            logo: '/gci-logo.png',
            contact: {
              address: '',
              phone: '',
              email: '',
              socialMedia: {}
            },
            exchangeRate: 1
          };
        }
        
        if (!adminData) {
          console.log('No company info found');
          return null;
        }
        
        const companyRecord = adminData as CompanyInfoRecord[];
        if (!companyRecord.length) {
          return null;
        }
        
        // Use the helper function to safely extract contact information
        const contactInfo = extractContactInfo(companyRecord[0].contact);
        
        // Map the data to the CompanyInfo type
        return {
          name: companyRecord[0].name,
          slogan: companyRecord[0].slogan || '',
          about: companyRecord[0].about || '',
          logo: companyRecord[0].logo_url || '/gci-logo.png',
          contact: contactInfo,
          exchangeRate: 1
        };
      }
      
      return {
        name: 'شركة الذهبية للصناعات الكيمياوية',
        slogan: 'جودة تدوم مع الوقت',
        about: '',
        logo: '/gci-logo.png',
        contact: {
          address: '',
          phone: '',
          email: '',
          socialMedia: {}
        },
        exchangeRate: 1
      };
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
      logo: data.logo_url || '/gci-logo.png',
      contact: contactInfo,
      exchangeRate: 1
    };
  } catch (error) {
    console.error('Unexpected error fetching company info:', error);
    return {
      name: 'شركة الذهبية للصناعات الكيمياوية',
      slogan: 'جودة تدوم مع الوقت',
      about: '',
      logo: '/gci-logo.png',
      contact: {
        address: '',
        phone: '',
        email: '',
        socialMedia: {}
      },
      exchangeRate: 1
    };
  }
};

// Create an alias for fetchCompanyInfo as getCompanyInfo
export const getCompanyInfo = fetchCompanyInfo;

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
