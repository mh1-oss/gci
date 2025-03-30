
// DEPRECATED: This file is being phased out in favor of modular service files.
// Please import from the appropriate service module instead.
// For example:
// - For products: import { fetchProducts } from '@/services/products/productService';
// - For categories: import { fetchCategories } from '@/services/categories/categoryService';
// - For company info: import { fetchCompanyInfo } from '@/services/company/companyService';
// - For reviews: import { fetchReviews } from '@/services/reviews/reviewsService';
// - For banners: import { fetchBanners } from '@/services/banners/bannerService';
// - For media uploads: import { uploadMedia } from '@/services/media/mediaService';

import { supabase } from "@/integrations/supabase/client";
import { Product, Review, Banner } from "@/data/initialData";

// Non-deprecated functions that haven't been migrated yet

export const getProducts = async (): Promise<Product[]> => {
  console.warn("getProducts() in dataService.ts is deprecated. Use fetchProducts() from '@/services/products/productService' instead.");
  
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
  console.warn("getProductById() in dataService.ts is deprecated. Use fetchProductById() from '@/services/products/productService' instead.");
  
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
  console.warn("getReviews() in dataService.ts is deprecated. Use fetchReviews() from '@/services/reviews/reviewsService' instead.");
  
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
  console.warn("getBanners() in dataService.ts is deprecated. Use fetchBanners() from '@/services/banners/bannerService' instead.");
  
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

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  console.warn("getProductsByCategory() in dataService.ts is deprecated. Use fetchProductsByCategory() from '@/services/products/productService' instead.");
  
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
  console.warn("getFeaturedProducts() in dataService.ts is deprecated. Use fetchFeaturedProducts() from '@/services/products/productService' instead.");
  
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

// Re-export from the proper service files to maintain backward compatibility
export * from './products/productService';
export * from './categories/categoryService';
export * from './company/companyService';
export * from './reviews/reviewsService';
export * from './banners/bannerService';
export * from './media/mediaService';
export * from './auth/authService';
export * from './sales/salesService';
export * from './stock/stockService';
