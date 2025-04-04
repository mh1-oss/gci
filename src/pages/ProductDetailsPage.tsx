
import { useParams } from 'react-router-dom';
import ProductInfo from '@/components/Products/ProductInfo';
import RelatedProducts from '@/components/Products/RelatedProducts';
import ProductLoadingState from '@/components/Products/LoadingState';
import ProductErrorState from '@/components/Products/ErrorState';
import { useProductDetails } from '@/hooks/useProductDetails';
import { mapDbProductToProduct } from '@/utils/models/productMappers';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { product, relatedProducts, isLoading, error } = useProductDetails(id);

  if (isLoading) {
    return <ProductLoadingState />;
  }

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
