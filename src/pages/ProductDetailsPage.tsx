
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Product } from "@/data/initialData";
import { fetchProductById, fetchFeaturedProducts } from "@/services/products/productService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/Products/ProductCard";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Info, FileText, ShoppingCart, ChevronRight, Plus, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [activeImage, setActiveImage] = useState("");
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!id) return;
        
        const productData = await fetchProductById(id);
        if (productData) {
          setProduct(productData);
          setActiveImage(productData.image);
          
          // Load related products (using featured products as a substitute)
          const featured = await fetchFeaturedProducts();
          setRelatedProducts(featured.filter(p => p.id !== id).slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "تعذر تحميل تفاصيل المنتج",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Reset quantity and active tab when product ID changes
    setQuantity(1);
    setActiveTab("details");
    
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
      
      toast({
        title: "تمت الإضافة إلى السلة",
        description: `تمت إضافة ${product.name} إلى سلة التسوق`,
      });
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-pulse flex flex-col w-full gap-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-24 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
        <p className="mb-6">عذراً، لم يتم العثور على المنتج المطلوب</p>
        <Button asChild>
          <Link to="/products">العودة إلى صفحة المنتجات</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-custom py-8" dir="rtl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center text-sm text-gray-500">
        <Link to="/" className="hover:text-gray-800">الرئيسية</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link to="/products" className="hover:text-gray-800">المنتجات</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-800">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 mb-4">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnail Gallery */}
          {product.mediaGallery && product.mediaGallery.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              <div 
                className={`aspect-square rounded-lg overflow-hidden border ${activeImage === product.image ? 'border-primary' : 'border-gray-200'} cursor-pointer`}
                onClick={() => setActiveImage(product.image)}
              >
                <img 
                  src={product.image} 
                  alt="Main" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.mediaGallery.map((media, index) => 
                media.type === 'image' && (
                  <div 
                    key={index}
                    className={`aspect-square rounded-lg overflow-hidden border ${activeImage === media.url ? 'border-primary' : 'border-gray-200'} cursor-pointer`}
                    onClick={() => setActiveImage(media.url)}
                  >
                    <img 
                      src={media.url} 
                      alt={`صورة ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="text-2xl font-bold text-primary mb-4">
            {formatPrice(product.price)}
          </div>

          <div className="mb-6">
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">الألوان المتاحة:</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, index) => (
                  <div key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {color}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">الكمية:</h3>
            <div className="flex items-center border border-gray-300 rounded-md w-32">
              <button 
                className="px-3 py-2 hover:bg-gray-100"
                onClick={decrementQuantity}
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center border-0 focus:ring-0"
                min="1"
              />
              <button 
                className="px-3 py-2 hover:bg-gray-100"
                onClick={incrementQuantity}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button className="w-full mb-4" onClick={handleAddToCart}>
            <ShoppingCart className="ml-2 h-5 w-5" />
            إضافة إلى السلة
          </Button>

          {/* Specs PDF */}
          {product.specsPdf && (
            <a 
              href={product.specsPdf} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-primary hover:underline mb-6"
            >
              <FileText className="h-4 w-4 mr-2" />
              تحميل ملف المواصفات (PDF)
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="details">
            <Info className="h-4 w-4 ml-2" />
            التفاصيل والمواصفات
          </TabsTrigger>
          <TabsTrigger value="paint-calculator">
            <Info className="h-4 w-4 ml-2" />
            حاسبة الطلاء
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {product.specifications && Object.keys(product.specifications).length > 0 ? (
                <div className="divide-y">
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <div key={index} className="py-2 grid grid-cols-3">
                      <div className="font-semibold">{key}</div>
                      <div className="col-span-2">{value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>لا توجد مواصفات متاحة لهذا المنتج.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paint-calculator" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">حاسبة الطلاء</h3>
                <p>استخدم هذه الأداة لحساب كمية الطلاء التي تحتاجها بناءً على مساحة الجدران.</p>
              </div>
              
              <div className="mb-4">
                <p className="font-semibold">معلومات التغطية:</p>
                <p>
                  التغطية لكل لتر: {product.coverage ? product.coverage : 10} متر مربع / لتر
                </p>
              </div>
              
              <Button asChild className="w-full">
                <Link to="/calculator">
                  انتقل إلى حاسبة الطلاء
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">منتجات ذات صلة</h2>
            <Link to="/products" className="text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard 
                key={relatedProduct.id} 
                product={relatedProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
