
import { Link } from "react-router-dom";
import { Product } from "@/data/initialData";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    
    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تمت إضافة ${product.name} إلى سلة التسوق`,
    });
  };
  
  return (
    <Card className="group overflow-hidden">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
          />
          {product.featured && (
            <Badge
              className="absolute top-2 right-2 bg-brand-blue hover:bg-brand-blue"
              variant="default"
            >
              منتج مميز
            </Badge>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:bg-opacity-30 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="rounded-full">
                <Eye className="h-4 w-4 ml-1" />
                التفاصيل
              </Button>
              
              <Button 
                size="sm" 
                className="rounded-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 ml-1" />
                أضف للسلة
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4 text-center">
          <h3 className="font-semibold text-lg mb-1 truncate" title={product.name}>
            {product.name}
          </h3>
          <p className="text-gray-500 text-sm mb-2 line-clamp-2" title={product.description}>
            {product.description}
          </p>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 text-center">
          <div className="w-full">
            <p className="font-bold text-brand-blue text-lg">
              {formatPrice(product.price)}
            </p>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default ProductCard;
