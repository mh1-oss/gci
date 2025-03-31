
import { Skeleton } from "@/components/ui/skeleton";

const ProductLoadingState = () => {
  return (
    <div className="container-custom py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image Skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-80 w-full max-w-md rounded-md" />
        </div>
        
        {/* Product Info Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
          </div>
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
      
      {/* Related Products Skeleton */}
      <div className="mt-12">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductLoadingState;
