
import { Category, Product, Review, Banner, CompanyInfo } from "@/data/initialData";
import { supabase } from "@/integrations/supabase/client";

export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) {
      console.error("Error fetching categories from Supabase:", error);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description || '',
        image: '/placeholder.svg'
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error("Error fetching products from Supabase:", error);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        categoryId: product.category_id || '',
        price: product.price,
        image: product.image_url || '/placeholder.svg',
        featured: false,
        colors: [],
        specifications: {},
        mediaGallery: []
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching product with id ${id} from Supabase:`, error);
      return undefined;
    }

    return data ? {
      id: data.id,
      name: data.name,
      description: data.description || '',
      categoryId: data.category_id || '',
      price: data.price,
      image: data.image_url || '/placeholder.svg',
      featured: false,
      colors: [],
      specifications: {},
      mediaGallery: []
    } : undefined;
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return undefined;
  }
};

export const getReviews = async (): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*');

    if (error) {
      console.error("Error fetching reviews from Supabase:", error);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((review: any) => ({
        id: review.id,
        customerName: review.customer_name,
        content: review.content,
        rating: review.rating,
        position: review.position,
        imageUrl: review.image_url,
        isApproved: review.is_approved
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
};

export const getBanners = async (): Promise<Banner[]> => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching banners:', error);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((banner: any) => ({
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image || '',
        videoUrl: banner.video_url,
        mediaType: (banner.media_type as "image" | "video") || "image",
        ctaText: banner.cta_text || 'اكتشف المزيد',
        ctaLink: banner.cta_link || '/products',
        orderIndex: banner.order_index,
        sliderHeight: banner.slider_height,
        textColor: banner.text_color
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;

    return data ? {
      id: data.id,
      name: data.name,
      description: data.description || '',
      image: '/placeholder.svg'
    } : null;
  } catch (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    return null;
  }
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId);

    if (error) return [];

    return data.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      categoryId: product.category_id || '',
      price: product.price,
      image: product.image_url || '/placeholder.svg',
      featured: false,
      colors: [],
      specifications: {},
      mediaGallery: []
    }));
  } catch (error) {
    console.error(`Error fetching products by category ${categoryId}:`, error);
    return [];
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) return [];

    return data.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      categoryId: product.category_id || '',
      price: product.price,
      image: product.image_url || '/placeholder.svg',
      featured: true,
      colors: [],
      specifications: {},
      mediaGallery: []
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

export const getCompanyInfo = async (): Promise<CompanyInfo | null> => {
  try {
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .single();

    if (error) return null;

    if (!data) return null;
    
    // Fixed: Properly handle the contact object with type safety
    const contactData = typeof data.contact === 'object' && data.contact !== null 
      ? data.contact 
      : {
          address: '',
          phone: '',
          email: '',
          socialMedia: {}
        };
    
    return {
      name: data.name,
      slogan: data.slogan || '',
      about: data.about || '',
      logo: data.logo_url || '/placeholder.svg',
      contact: {
        address: typeof contactData === 'object' && 'address' in contactData ? String(contactData.address || '') : '',
        phone: typeof contactData === 'object' && 'phone' in contactData ? String(contactData.phone || '') : '',
        email: typeof contactData === 'object' && 'email' in contactData ? String(contactData.email || '') : '',
        socialMedia: typeof contactData === 'object' && 'socialMedia' in contactData && 
          typeof contactData.socialMedia === 'object' && contactData.socialMedia !== null 
          ? contactData.socialMedia as Record<string, string> 
          : {}
      },
      exchangeRate: 1
    };
  } catch (error) {
    console.error('Error fetching company info:', error);
    return null;
  }
};

export const updateCompanyInfo = async (info: any) => {
  try {
    const { error } = await supabase
      .from('company_info')
      .update(info)
      .eq('id', 1);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating company info:', error);
    return false;
  }
};

export const addProduct = async (product: any) => {
  try {
    const { error } = await supabase
      .from('products')
      .insert([product]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error adding product:', error);
    return false;
  }
};

export const updateProduct = async (id: string, product: any) => {
  try {
    const { error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

export const addCategory = async (category: any) => {
  try {
    const { error } = await supabase
      .from('categories')
      .insert([category]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error adding category:', error);
    return false;
  }
};

export const updateCategory = async (id: string, category: any) => {
  try {
    const { error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating category:', error);
    return false;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};

export const uploadMedia = async (file: File, bucket: string = 'media'): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading media:', error);
    return null;
  }
};
