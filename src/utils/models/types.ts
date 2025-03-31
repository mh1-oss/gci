// Database types representing the Supabase database schema
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
  categories?: { name: string } | null;
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
  created_at: string;
  updated_at: string;
}

export interface DbStockTransaction {
  id: string;
  product_id: string;
  quantity: number;
  transaction_type: 'in' | 'out';
  notes: string | null;
  created_at: string;
}

export interface DbSale {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  total_amount: number;
  created_at: string;
}

export interface DbSaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface SaleItem {
  id: string;
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
  created_at: string;
  items: SaleItem[];
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
