
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

  // Validate the ID parameter and provide feedback
  useEffect(() => {
    // Log basic navigation information
    console.log(`ProductDetailsPage loaded with ID: ${id}`);
    
    // Validate the ID parameter
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('Invalid product ID parameter');
      toast({
        title: "خطأ في معرف المنتج",
        description: "معرف المنتج غير صالح",
        variant: "destructive",
      });
      // Navigate away after showing the toast
      setTimeout(() => navigate('/products'), 1000);
      return;
    }
    
    // Log any errors that occur
    if (error) {
      console.error('Product details error:', error);
      
      // Show a toast for "product not found" errors
      if (error instanceof Error && error.message === "Product not found") {
        toast({
          title: "المنتج غير موجود",
          description: "لم يتم العثور على المنتج الذي تبحث عنه",
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
