
import { Product } from "@/data/initialData";
import ProductCard from "@/components/Products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onClearFilters: () => void;
}

// No results component
const NoResults = ({ onClearFilters }: { onClearFilters: () => void }) => (
  <div className="text-center py-12">
    <h3 className="text-xl font-semibold mb-2">لم يتم العثور على منتجات</h3>
    <p className="text-gray-500 mb-6">
      حاول تغيير معايير البحث أو تصفح جميع المنتجات.
    </p>
    <Button onClick={onClearFilters}>عرض جميع المنتجات</Button>
  </div>
);

// Loading skeletons for products
const ProductSkeletons = () => (
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
);

const ProductGrid = ({ products, loading, onClearFilters }: ProductGridProps) => {
  if (loading) {
    return <ProductSkeletons />;
  }

  if (products.length === 0) {
    return <NoResults onClearFilters={onClearFilters} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
