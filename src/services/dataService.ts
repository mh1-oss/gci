
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

// Products
export const getProducts = (): Promise<Product[]> => {
  return Promise.resolve([...products]);
};

export const getProductById = (id: string): Promise<Product | undefined> => {
  const product = products.find(p => p.id === id);
  return Promise.resolve(product);
};

export const getProductsByCategory = (categoryId: string): Promise<Product[]> => {
  const filteredProducts = products.filter(p => p.categoryId === categoryId);
  return Promise.resolve([...filteredProducts]);
};

export const getFeaturedProducts = (): Promise<Product[]> => {
  const featuredProducts = products.filter(p => p.featured);
  return Promise.resolve([...featuredProducts]);
};

export const addProduct = (product: Omit<Product, 'id'>): Promise<Product> => {
  const newProduct = {
    ...product,
    id: `p${Date.now()}`
  };
  
  products = [...products, newProduct];
  setLocalStorageData('products', products);
  
  return Promise.resolve(newProduct);
};

export const updateProduct = (id: string, updates: Partial<Product>): Promise<Product | undefined> => {
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

export const deleteProduct = (id: string): Promise<boolean> => {
  const initialLength = products.length;
  products = products.filter(p => p.id !== id);
  
  if (products.length !== initialLength) {
    setLocalStorageData('products', products);
    return Promise.resolve(true);
  }
  
  return Promise.resolve(false);
};

// Categories
export const getCategories = (): Promise<Category[]> => {
  return Promise.resolve([...categories]);
};

export const getCategoryById = (id: string): Promise<Category | undefined> => {
  const category = categories.find(c => c.id === id);
  return Promise.resolve(category);
};

export const addCategory = (category: Omit<Category, 'id'>): Promise<Category> => {
  const newCategory = {
    ...category,
    id: `cat${Date.now()}`
  };
  
  categories = [...categories, newCategory];
  setLocalStorageData('categories', categories);
  
  return Promise.resolve(newCategory);
};

export const updateCategory = (id: string, updates: Partial<Category>): Promise<Category | undefined> => {
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

export const deleteCategory = (id: string): Promise<boolean> => {
  const initialLength = categories.length;
  categories = categories.filter(c => c.id !== id);
  
  if (categories.length !== initialLength) {
    setLocalStorageData('categories', categories);
    return Promise.resolve(true);
  }
  
  return Promise.resolve(false);
};

// Banners
export const getBanners = (): Promise<Banner[]> => {
  return Promise.resolve([...banners]);
};

export const updateBanner = (id: string, updates: Partial<Banner>): Promise<Banner | undefined> => {
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
export const getCompanyInfo = (): Promise<CompanyInfo> => {
  return Promise.resolve({...companyInfo});
};

export const updateCompanyInfo = (updates: Partial<CompanyInfo>): Promise<CompanyInfo> => {
  companyInfo = {
    ...companyInfo,
    ...updates
  };
  
  setLocalStorageData('companyInfo', companyInfo);
  
  return Promise.resolve({...companyInfo});
};

// Media Upload function
export const uploadMedia = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // In a real application, you would upload to a server or storage service
    // Here we're using FileReader to simulate a file upload
    const reader = new FileReader();
    
    reader.onload = (event) => {
      // Simulating a delay to mimic upload time
      setTimeout(() => {
        if (event.target?.result) {
          // Return a data URL in this mock implementation
          // In a real app, this would be the URL from your storage service
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
export const resetData = (): Promise<void> => {
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
