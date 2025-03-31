
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/data/initialData';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, ArrowLeft, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { toast } from '@/hooks/use-toast';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [quantity, setQuantity] = useState(1);

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return data as (Product & { categories: { name: string } });
      } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
    }
  });

  // Also fetch related products from the same category
  const { data: relatedProducts } = useQuery({
    queryKey: ['relatedProducts', product?.category_id],
    queryFn: async () => {
      if (!product?.category_id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .neq('id', id)
        .limit(4);
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!product?.category_id
  });

  const handleAddToCart = () => {
    if (product) {
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
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">لم يتم العثور على المنتج</h2>
        <p className="text-gray-600 mb-6">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
        <Button onClick={() => navigate('/products')}>
          العودة إلى المنتجات
        </Button>
      </div>
    );
  }

  return (
    <div className="container-custom py-12" dir="rtl">
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
      
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">منتجات ذات صلة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <Card 
                key={relatedProduct.id} 
                className="overflow-hidden hover:shadow-md transition-shadow"
                onClick={() => navigate(`/products/${relatedProduct.id}`)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={relatedProduct.image_url || '/placeholder.svg'} 
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
      )}
    </div>
  );
};

export default ProductDetailsPage;
