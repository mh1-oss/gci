
import { useState, useEffect } from "react";
import { Category } from "@/data/initialData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FilterX } from "lucide-react";

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  searchTerm: string;
  onCategoryChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const ProductFilters = ({
  categories,
  selectedCategory,
  searchTerm,
  onCategoryChange,
  onSearchChange,
  onSearchSubmit,
  onClearFilters,
  hasActiveFilters
}: ProductFiltersProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Category filter */}
        <div className="w-full md:w-1/3">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            الفئة
          </label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger id="category-filter" className="w-full">
              <SelectValue placeholder="جميع الفئات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">جميع الفئات</SelectItem>
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
          <form onSubmit={onSearchSubmit} className="flex gap-2">
            <div className="flex-grow">
              <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
                بحث
              </label>
              <div className="relative">
                <Input
                  id="search-filter"
                  type="text"
                  placeholder="ابحث عن المنتجات..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-3"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <Button type="submit" className="mt-auto">بحث</Button>
          </form>
        </div>
        
        {/* Clear filters */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="md:mt-auto flex items-center gap-1"
          >
            <FilterX className="h-4 w-4 ml-1" />
            مسح الفلاتر
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
