
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock_quantity: number; // Changed from 'stock' to 'stock_quantity'
  created_at?: string;
  categoryId: string;
  image: string;
  featured: boolean;
  colors: string[]; 
  specifications?: Record<string, string>;
  mediaGallery?: {
    url: string;
    type: 'image' | 'video';
  }[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Sale {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  currency: 'USD' | 'IQD';
  items: SaleItem[];
}

export interface DbProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  cost_price: number;
  stock_quantity: number;
  image_url: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  categories?: DbCategory | Record<string, any> | null;
  featured: boolean | null; // Made nullable since it might not exist in the database
  colors: string[] | null; // Made nullable since it might not exist in the database
  specifications: Record<string, string> | null; // Made nullable since it might not exist in the database
  media_gallery: {
    url: string;
    type: 'image' | 'video';
  }[] | null; // Made nullable since it might not exist in the database
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
  logo_url: string | null;
  slogan: string | null;
  about: string | null;
  contact: any | null;
  slider_timing: number | null;
  features_title: string | null;
  features_description: string | null;
  reviews_title: string | null;
  reviews_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockTransaction {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  transaction_type: 'in' | 'out';
  notes: string | null;
  created_at: string;
}

export interface DbStockTransaction {
  id: string;
  product_id: string;
  quantity: number;
  transaction_type: 'in' | 'out';
  notes: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
