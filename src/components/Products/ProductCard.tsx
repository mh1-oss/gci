
import { Link } from "react-router-dom";
import { Product } from "@/data/initialData";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { formatPrice } = useCurrency();

  // Function to open PDF in a new tab
  const handleViewPDF = () => {
    if (product.specsPdf) {
      window.open(product.specsPdf, '_blank');
    } else {
      toast({
        title: "غير متوفر",
        description: "ملف المواصفات غير متوفر لهذا المنتج",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="product-card overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardContent className="p-4 flex-grow">
        <h3 className="font-semibold text-lg mb-2 hover:text-brand-blue transition-colors">
          <Link to={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        <p className="text-brand-blue font-bold text-lg">
          {formatPrice(product.price)}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="w-full flex gap-2">
          <Link to={`/products/${product.id}`} className="flex-grow">
            <Button variant="outline" className="w-full">
              عرض التفاصيل
            </Button>
          </Link>
          <Button 
            variant="default" 
            className="w-full"
            onClick={handleViewPDF}
            disabled={!product.specsPdf}
          >
            <FileText className="mr-2 h-4 w-4" />
            عرض المواصفات
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
