
// This file is deprecated. Import from the appropriate service modules instead.
// For example:
// import { fetchProducts } from '@/services/products/productService';
// import { fetchCategories } from '@/services/categories/categoryService';
// import { checkIsAdmin } from '@/services/auth/authService';
// import { uploadMedia } from '@/services/media/mediaService';

import { toast } from '@/hooks/use-toast';

// Re-export everything from the new service files for backward compatibility
export * from './auth/authService';
export * from './products/productService';
export * from './categories/categoryService';
export * from './company/companyService';
export * from './media/mediaService';
export * from './sales/salesService';
export * from './stock/stockService';

// Notify about deprecation when imported
console.warn('supabaseService.ts is deprecated. Please import directly from the individual service modules.');
