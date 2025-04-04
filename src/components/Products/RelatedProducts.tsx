
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/utils/models/types";
import { useCurrency } from "@/context/CurrencyContext";
import { useNavigate } from "react-router-dom";

interface RelatedProductsProps {
  products: Product[];
}

const RelatedProducts = ({ products }: { products: Product[] }) => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">منتجات ذات صلة</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((relatedProduct) => (
          <Card 
            key={relatedProduct.id} 
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/products/${relatedProduct.id}`)}
          >
            <div className="h-48 overflow-hidden">
              <img 
                src={relatedProduct.image || '/placeholder.svg'} 
                alt={relatedProduct.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium truncate">{relatedProduct.name}</h3>
              <p className="text-primary font-bold mt-2">
                {formatPrice(relatedProduct.price)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
