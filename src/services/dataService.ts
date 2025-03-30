
import { 
  products as initialProducts, 
  categories as initialCategories,
  banners as initialBanners,
  companyInfo as initialCompanyInfo,
  Product, 
  Category,
  Banner,
  CompanyInfo,
  MediaItem
} from '@/data/initialData';

import {
  fetchProducts as fetchSupabaseProducts,
  fetchProductById as fetchSupabaseProductById,
  fetchProductsByCategory as fetchSupabaseProductsByCategory,
  fetchFeaturedProducts as fetchSupabaseFeaturedProducts,
  createProduct as createSupabaseProduct,
  updateProduct as updateSupabaseProduct,
  deleteProduct as deleteSupabaseProduct,
  fetchCategories as fetchSupabaseCategories,
  fetchCategoryById as fetchSupabaseCategoryById,
  createCategory as createSupabaseCategory,
  updateCategory as updateSupabaseCategory,
  deleteCategory as deleteSupabaseCategory,
  fetchCompanyInfo as fetchSupabaseCompanyInfo,
  updateCompanyInfo as updateSupabaseCompanyInfo,
  uploadMedia as uploadSupabaseMedia
} from './supabaseService';

// Helper function to safely parse localStorage data
const getLocalStorageData = <T>(key: string, initialData: T): T => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : initialData;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return initialData;
  }
};

// Helper function to safely save data to localStorage
const setLocalStorageData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Initialize data from localStorage or use default data
let products = getLocalStorageData<Product[]>('products', initialProducts);
let categories = getLocalStorageData<Category[]>('categories', initialCategories);
let banners = getLocalStorageData<Banner[]>('banners', initialBanners);
let companyInfo = getLocalStorageData<CompanyInfo>('companyInfo', initialCompanyInfo);

// Flag to determine if we should use Supabase or local storage
// In a real app, you might want to make this configurable or based on environment
const useSupabase = true;

// Products
export const getProducts = async (): Promise<Product[]> => {
  if (useSupabase) {
    const supabaseProducts = await fetchSupabaseProducts();
    return supabaseProducts;
  }
  
  return Promise.resolve([...products]);
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  if (useSupabase) {
    const product = await fetchSupabaseProductById(id);
    return product || undefined;
  }
  
  const product = products.find(p => p.id === id);
  return Promise.resolve(product);
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  if (useSupabase) {
    const filteredProducts = await fetchSupabaseProductsByCategory(categoryId);
    return filteredProducts;
  }
  
  const filteredProducts = products.filter(p => p.categoryId === categoryId);
  return Promise.resolve([...filteredProducts]);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  if (useSupabase) {
    const featuredProducts = await fetchSupabaseFeaturedProducts();
    return featuredProducts;
  }
  
  const featuredProducts = products.filter(p => p.featured);
  return Promise.resolve([...featuredProducts]);
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | undefined> => {
  if (useSupabase) {
    const newProduct = await createSupabaseProduct(product);
    return newProduct || undefined;
  }
  
  const newProduct = {
    ...product,
    id: `p${Date.now()}`
  };
  
  products = [...products, newProduct];
  setLocalStorageData('products', products);
  
  return Promise.resolve(newProduct);
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product | undefined> => {
  if (useSupabase) {
    const updatedProduct = await updateSupabaseProduct(id, updates);
    return updatedProduct || undefined;
  }
  
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    return Promise.resolve(undefined);
  }
  
  const updatedProduct = {
    ...products[index],
    ...updates
  };
  
  products = [
    ...products.slice(0, index),
    updatedProduct,
    ...products.slice(index + 1)
  ];
  
  setLocalStorageData('products', products);
  
  return Promise.resolve(updatedProduct);
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (useSupabase) {
    return deleteSupabaseProduct(id);
  }
  
  const initialLength = products.length;
  products = products.filter(p => p.id !== id);
  
  if (products.length !== initialLength) {
    setLocalStorageData('products', products);
    return Promise.resolve(true);
  }
  
  return Promise.resolve(false);
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  if (useSupabase) {
    const supabaseCategories = await fetchSupabaseCategories();
    return supabaseCategories;
  }
  
  return Promise.resolve([...categories]);
};

export const getCategoryById = async (id: string): Promise<Category | undefined> => {
  if (useSupabase) {
    const category = await fetchSupabaseCategoryById(id);
    return category || undefined;
  }
  
  const category = categories.find(c => c.id === id);
  return Promise.resolve(category);
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<Category | undefined> => {
  if (useSupabase) {
    const newCategory = await createSupabaseCategory(category);
    return newCategory || undefined;
  }
  
  const newCategory = {
    ...category,
    id: `cat${Date.now()}`
  };
  
  categories = [...categories, newCategory];
  setLocalStorageData('categories', categories);
  
  return Promise.resolve(newCategory);
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category | undefined> => {
  if (useSupabase) {
    const updatedCategory = await updateSupabaseCategory(id, updates);
    return updatedCategory || undefined;
  }
  
  const index = categories.findIndex(c => c.id === id);
  
  if (index === -1) {
    return Promise.resolve(undefined);
  }
  
  const updatedCategory = {
    ...categories[index],
    ...updates
  };
  
  categories = [
    ...categories.slice(0, index),
    updatedCategory,
    ...categories.slice(index + 1)
  ];
  
  setLocalStorageData('categories', categories);
  
  return Promise.resolve(updatedCategory);
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  if (useSupabase) {
    return deleteSupabaseCategory(id);
  }
  
  const initialLength = categories.length;
  categories = categories.filter(c => c.id !== id);
  
  if (categories.length !== initialLength) {
    setLocalStorageData('categories', categories);
    return Promise.resolve(true);
  }
  
  return Promise.resolve(false);
};

// Banners
export const getBanners = async (): Promise<Banner[]> => {
  // For now, we'll continue using local storage for banners
  return Promise.resolve([...banners]);
};

export const updateBanner = async (id: string, updates: Partial<Banner>): Promise<Banner | undefined> => {
  // For now, we'll continue using local storage for banners
  const index = banners.findIndex(b => b.id === id);
  
  if (index === -1) {
    return Promise.resolve(undefined);
  }
  
  const updatedBanner = {
    ...banners[index],
    ...updates
  };
  
  banners = [
    ...banners.slice(0, index),
    updatedBanner,
    ...banners.slice(index + 1)
  ];
  
  setLocalStorageData('banners', banners);
  
  return Promise.resolve(updatedBanner);
};

// Company Info
export const getCompanyInfo = async (): Promise<CompanyInfo> => {
  if (useSupabase) {
    const info = await fetchSupabaseCompanyInfo();
    if (info) {
      return info;
    }
    // Fallback to local storage if no data in Supabase
  }
  
  return Promise.resolve({...companyInfo});
};

export const updateCompanyInfo = async (updates: Partial<CompanyInfo>): Promise<CompanyInfo> => {
  if (useSupabase) {
    const updatedInfo = await updateSupabaseCompanyInfo(updates);
    if (updatedInfo) {
      return updatedInfo;
    }
    // Fallback to local storage if update fails
  }
  
  companyInfo = {
    ...companyInfo,
    ...updates
  };
  
  setLocalStorageData('companyInfo', companyInfo);
  
  return Promise.resolve({...companyInfo});
};

// Media Upload function
export const uploadMedia = async (file: File): Promise<string> => {
  if (useSupabase) {
    const uploadedUrl = await uploadSupabaseMedia(file);
    if (uploadedUrl) {
      return uploadedUrl;
    }
    // Fall back to local storage approach if upload fails
  }
  
  // Original implementation as fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      setTimeout(() => {
        if (event.target?.result) {
          resolve(event.target.result.toString());
        } else {
          reject(new Error("Failed to read file"));
        }
      }, 1000);
    };
    
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
    
    reader.readAsDataURL(file);
  });
};

// Reset to initial data (for testing)
export const resetData = async (): Promise<void> => {
  // We won't reset Supabase data, only local storage
  products = [...initialProducts];
  categories = [...initialCategories];
  banners = [...initialBanners];
  companyInfo = {...initialCompanyInfo};
  
  setLocalStorageData('products', products);
  setLocalStorageData('categories', categories);
  setLocalStorageData('banners', banners);
  setLocalStorageData('companyInfo', companyInfo);
  
  return Promise.resolve();
};
