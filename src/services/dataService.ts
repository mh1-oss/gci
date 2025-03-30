
// DEPRECATED: This file is being phased out in favor of modular service files.
// Please import from the appropriate service module instead.
// For example:
// - For products: import { fetchProducts } from '@/services/products/productService';
// - For categories: import { fetchCategories } from '@/services/categories/categoryService';
// - For company info: import { fetchCompanyInfo } from '@/services/company/companyService';
// - For reviews: import { fetchReviews } from '@/services/reviews/reviewsService';
// - For banners: import { fetchBanners } from '@/services/banners/bannerService';
// - For media uploads: import { uploadMedia } from '@/services/media/mediaService';

// Re-export from the proper service files for backward compatibility
export * from './products/productService';
export * from './categories/categoryService';
export * from './company/companyService';
export * from './reviews/reviewsService';
export * from './banners/bannerService';
export * from './media/mediaService';
export * from './auth/authService';
export * from './sales/salesService';
export * from './stock/stockService';

// Add deprecation notice when imported
console.warn("dataService.ts is deprecated. Please import directly from the individual service modules.");
