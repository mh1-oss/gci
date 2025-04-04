
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ProductInfo from '@/components/Products/ProductInfo';
import RelatedProducts from '@/components/Products/RelatedProducts';
import ProductLoadingState from '@/components/Products/LoadingState';
import ProductErrorState from '@/components/Products/ErrorState';
import { useProductDetails } from '@/hooks/useProductDetails';
import { mapDbProductToProduct } from '@/utils/models/productMappers';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, relatedProducts, isLoading, error } = useProductDetails(id);

  // Log navigation and error information for debugging
  useEffect(() => {
    console.log(`ProductDetailsPage loaded with ID: ${id}`);
    if (error) {
      console.error('Product details error:', error);
    }
  }, [id, error]);

  // Handle loading state
  if (isLoading) {
    return <ProductLoadingState />;
  }

  // Handle error or not found state
  if (error || !product) {
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
