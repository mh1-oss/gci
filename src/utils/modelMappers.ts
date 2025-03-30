
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

// Additional types for our application
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

export function mapDbSaleToSale(dbSale: DbSale, saleItems: SaleItem[] = []): Sale {
  return {
    id: dbSale.id,
    customer_name: dbSale.customer_name,
    customer_phone: dbSale.customer_phone,
    customer_email: dbSale.customer_email,
    total_amount: dbSale.total_amount,
    created_at: dbSale.created_at,
    items: saleItems
  };
}

export function mapSaleToDbSale(sale: Omit<Sale, 'id' | 'items' | 'created_at'>): Omit<DbSale, 'id' | 'created_at'> {
  return {
    customer_name: sale.customer_name,
    customer_phone: sale.customer_phone,
    customer_email: sale.customer_email,
    total_amount: sale.total_amount
  };
}

export function mapDbSaleItemWithProductToSaleItem(dbSaleItem: DbSaleItem, productName: string): SaleItem {
  return {
    id: dbSaleItem.id,
    product_id: dbSaleItem.product_id,
    product_name: productName,
    quantity: dbSaleItem.quantity,
    unit_price: dbSaleItem.unit_price,
    total_price: dbSaleItem.total_price
  };
}

export function mapSaleItemToDbSaleItem(saleItem: Omit<SaleItem, 'id' | 'product_name'>, saleId: string): Omit<DbSaleItem, 'id' | 'created_at'> {
  return {
    sale_id: saleId,
    product_id: saleItem.product_id,
    quantity: saleItem.quantity,
    unit_price: saleItem.unit_price,
    total_price: saleItem.total_price
  };
}

export function mapDbStockTransactionToStockTransaction(dbTransaction: DbStockTransaction, productName: string): StockTransaction {
  return {
    id: dbTransaction.id,
    product_id: dbTransaction.product_id,
    product_name: productName,
    quantity: dbTransaction.quantity,
    transaction_type: dbTransaction.transaction_type,
    notes: dbTransaction.notes,
    created_at: dbTransaction.created_at
  };
}

export function mapStockTransactionToDbStockTransaction(transaction: Omit<StockTransaction, 'id' | 'product_name' | 'created_at'>): Omit<DbStockTransaction, 'id' | 'created_at'> {
  return {
    product_id: transaction.product_id,
    quantity: transaction.quantity,
    transaction_type: transaction.transaction_type,
    notes: transaction.notes
  };
}
