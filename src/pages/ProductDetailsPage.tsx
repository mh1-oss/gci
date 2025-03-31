
import { useParams } from 'react-router-dom';
import ProductInfo from '@/components/Products/ProductInfo';
import RelatedProducts from '@/components/Products/RelatedProducts';
import ProductLoadingState from '@/components/Products/LoadingState';
import ProductErrorState from '@/components/Products/ErrorState';
import { useProductDetails } from '@/hooks/useProductDetails';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { product, relatedProducts, isLoading, error } = useProductDetails(id);

  if (isLoading) {
    return <ProductLoadingState />;
  }

  if (error || !product) {
    return <ProductErrorState />;
  }

  return (
    <div className="container-custom py-12" dir="rtl">
      <ProductInfo product={product} />
      
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  );
};

export default ProductDetailsPage;
