
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DbProduct } from "@/utils/models/types";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { toast } from "@/hooks/use-toast";

interface ProductInfoProps {
  product: DbProduct;
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '/placeholder.svg',
      quantity
    });
    
    toast({
      title: "تمت الإضافة إلى السلة",
      description: `تمت إضافة ${product.name} إلى سلة التسوق`,
    });
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => navigate('/products')} 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 ml-2" />
        العودة إلى المنتجات
      </Button>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <img 
            src={product.image_url || '/placeholder.svg'} 
            alt={product.name} 
            className="w-full h-96 object-contain p-4"
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            
            {product.categories && (
              <p className="text-gray-500 mt-2">
                الفئة: {product.categories.name}
              </p>
            )}
          </div>
          
          <div>
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.stock_quantity > 0 ? (
              <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded mr-2">
                متوفر
              </span>
            ) : (
              <span className="inline-block bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded mr-2">
                غير متوفر
              </span>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">الوصف</h3>
            <p className="text-gray-700">{product.description || 'لا يوجد وصف متاح لهذا المنتج.'}</p>
          </div>
          
          <div className="py-4">
            <div className="flex items-center space-x-4 space-x-reverse my-4">
              <span className="text-gray-700">الكمية:</span>
              <div className="flex items-center border border-gray-300 rounded">
                <button 
                  onClick={decrementQuantity}
                  className="px-3 py-1 border-l border-gray-300"
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button 
                  onClick={incrementQuantity}
                  className="px-3 py-1 border-r border-gray-300"
                >
                  +
                </button>
              </div>
            </div>
            
            <Button 
              onClick={handleAddToCart} 
              className="w-full md:w-auto"
              disabled={product.stock_quantity <= 0}
            >
              <ShoppingCart className="ml-2 h-4 w-4" />
              إضافة إلى السلة
            </Button>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <p className="flex items-center text-gray-600">
              <Package className="h-4 w-4 ml-2" />
              المتوفر في المخزون: {product.stock_quantity} وحدة
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductInfo;
