
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProductInfo from '@/components/Products/ProductInfo';
import RelatedProducts from '@/components/Products/RelatedProducts';
import ProductLoadingState from '@/components/Products/LoadingState';
import ProductErrorState from '@/components/Products/ErrorState';
import { useProductDetails } from '@/hooks/useProductDetails';
import { mapDbProductToProduct } from '@/utils/models/productMappers';
import { useToast } from '@/hooks/use-toast';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { product, relatedProducts, isLoading, error } = useProductDetails(id);

  // Handle errors and invalid IDs
  useEffect(() => {
    // Validate ID
    if (!id || id.trim() === '') {
      console.error('Invalid or empty product ID');
      toast({
        title: "خطأ في معرف المنتج",
        description: "معرف المنتج غير صالح أو فارغ",
        variant: "destructive",
      });
      setTimeout(() => navigate('/products'), 500);
      return;
    }

    // Log and handle errors
    if (error) {
      console.error('Product details error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Error message: ${errorMessage}`);
      
      // Show appropriate toast based on error type
      if (errorMessage === "Product not found") {
        toast({
          title: "المنتج غير موجود",
          description: "لم يتم العثور على المنتج المطلوب",
          variant: "destructive",
        });
      } else {
        toast({
          title: "خطأ في تحميل المنتج",
          description: "حدث خطأ أثناء محاولة تحميل بيانات المنتج، يرجى المحاولة مرة أخرى",
          variant: "destructive",
        });
      }
    }
  }, [id, error, toast, navigate]);

  // Handle loading state
  if (isLoading) {
    return <ProductLoadingState />;
  }

  // Handle error or not found state
  if (error || !product) {
    console.log("Rendering error state due to:", error ? error.message : "Product not found");
    return <ProductErrorState />;
  }

  // Map DbProduct to Product
  const mappedProduct = mapDbProductToProduct(product);
  const mappedRelatedProducts = relatedProducts.map(mapDbProductToProduct);

  return (
    <div className="container-custom py-12" dir="rtl">
      <ProductInfo product={mappedProduct} />
      
      {mappedRelatedProducts.length > 0 && (
        <RelatedProducts products={mappedRelatedProducts} />
      )}
    </div>
  );
};

export default ProductDetailsPage;
