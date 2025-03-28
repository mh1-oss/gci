import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Product, Category } from "@/data/initialData";
import { getProducts, getCategories, getProductsByCategory } from "@/services/dataService";
import ProductCard from "@/components/Products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, FilterX } from "lucide-react";

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
    document.title = "Modern Paint - Products";
  }, []);

  // Fetch categories
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Fetch products when category or search changes
  useEffect(() => {
    setLoading(true);
    
    const fetchProducts = async () => {
      try {
        let data: Product[];
        
        if (categoryId) {
          data = await getProductsByCategory(categoryId);
        } else {
          data = await getProducts();
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
    
    fetchProducts();
  }, [categoryId, searchQuery]);

  // Get current category name
  const currentCategory = categoryId 
    ? categories.find(cat => cat.id === categoryId)?.name || "Products" 
    : "All Products";

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
    if (value) {
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
    <div className="py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{currentCategory}</h1>
          
          {/* Filters section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              {/* Category filter */}
              <div className="w-full md:w-1/3">
                <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger id="category-filter" className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Search filter */}
              <div className="w-full md:w-2/3">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-grow">
                    <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      Search
                    </label>
                    <div className="relative">
                      <Input
                        id="search-filter"
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="mt-auto">Search</Button>
                </form>
              </div>
              
              {/* Clear filters */}
              {(categoryId || searchQuery) && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="md:mt-auto flex items-center gap-1"
                >
                  <FilterX className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
          
          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  <Skeleton className="h-52 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-5 w-1/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                Try changing your search criteria or browse all products.
              </p>
              <Button onClick={clearFilters}>View All Products</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
