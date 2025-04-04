import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Product, Category } from "@/data/initialData";
import { fetchProducts, fetchProductsByCategory } from "@/services/products/productService";
import { fetchCategories } from "@/services/categories/categoryService"; 
import ProductFilters from "@/components/Products/ProductFilters";
import ProductGrid from "@/components/Products/ProductGrid";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState(categoryId);
  
  // Update document title
  useEffect(() => {
    document.title = "Modern Paint - المنتجات";
  }, []);

  // Fetch categories
  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // Fetch products when category or search changes
  useEffect(() => {
    setLoading(true);
    
    const getProductsData = async () => {
      try {
        let data: Product[];
        
        if (categoryId) {
          data = await fetchProductsByCategory(categoryId);
        } else {
          data = await fetchProducts();
        }
        
        // Filter by search term if provided
        if (searchQuery) {
          data = data.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    
    getProductsData();
  }, [categoryId, searchQuery]);

  // Get current category name
  const currentCategory = categoryId 
    ? categories.find(cat => cat.id === categoryId)?.name || "المنتجات" 
    : "جميع المنتجات";

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all-categories") {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    
    // Keep search term if exists
    if (searchQuery) {
      params.set("search", searchQuery);
    }
    
    setSearchParams(params);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSearchParams({});
  };

  return (
    <div className="py-8" dir="rtl">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{currentCategory}</h1>
          
          <ProductFilters 
            categories={categories}
            selectedCategory={selectedCategory}
            searchTerm={searchTerm}
            onCategoryChange={handleCategoryChange}
            onSearchChange={setSearchTerm}
            onSearchSubmit={handleSearch}
            onClearFilters={clearFilters}
            hasActiveFilters={!!(categoryId || searchQuery)}
          />
          
          <ProductGrid 
            products={products}
            loading={loading}
            onClearFilters={clearFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
