
import type { 
  Product, 
  Category,
  CompanyInfo,
  MediaItem
} from '@/data/initialData';

// Types representing the Supabase database schema
export interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price: number;
  cost_price: number;
  stock_quantity: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCompanyInfo {
  id: number;
  name: string;
  slogan: string | null;
  about: string | null;
  features_title: string | null;
  features_description: string | null;
  reviews_title: string | null;
  reviews_description: string | null;
  slider_timing: number | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

// Mapper functions to convert between DB and app models
export function mapDbProductToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    categoryId: dbProduct.category_id || '',
    price: dbProduct.price,
    image: dbProduct.image_url || '/placeholder.svg',
    featured: false, // Default value, can be updated if needed
    // Add other optional fields with default values
    colors: [],
    specifications: {},
    mediaGallery: []
  };
}

export function mapProductToDbProduct(product: Omit<Product, 'id'>): Omit<DbProduct, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: product.name,
    description: product.description,
    category_id: product.categoryId,
    price: product.price,
    cost_price: product.price * 0.7, // Assuming 30% margin, can adjust as needed
    stock_quantity: 0, // Default value
    image_url: product.image !== '/placeholder.svg' ? product.image : null
  };
}

export function mapDbCategoryToCategory(dbCategory: DbCategory): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description || '',
    image: '/placeholder.svg', // Default value
  };
}

export function mapCategoryToDbCategory(category: Omit<Category, 'id'>): Omit<DbCategory, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: category.name,
    description: category.description,
  };
}

export function mapDbCompanyInfoToCompanyInfo(dbInfo: DbCompanyInfo): CompanyInfo {
  return {
    name: dbInfo.name,
    logo: dbInfo.logo_url || '/placeholder.svg',
    slogan: dbInfo.slogan || '',
    about: dbInfo.about || '',
    contact: {
      address: '',
      phone: '',
      email: '',
      socialMedia: {}
    },
    exchangeRate: 1460 // Default value
  };
}

export function mapCompanyInfoToDbCompanyInfo(info: Partial<CompanyInfo>): Partial<DbCompanyInfo> {
  return {
    name: info.name,
    slogan: info.slogan,
    about: info.about,
    logo_url: info.logo !== '/placeholder.svg' ? info.logo : null
  };
}
