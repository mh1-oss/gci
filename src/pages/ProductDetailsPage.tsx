
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Product, Category } from "@/data/initialData";
import { getProductById, getCategoryById } from "@/services/dataService";
import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, FileText, Image, Video } from "lucide-react";

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const [activeMedia, setActiveMedia] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getProductById(id)
      .then(async (productData) => {
        if (productData) {
          setProduct(productData);
          // Set initial active media
          setActiveMedia(productData.image);
          // Get category details
          const categoryData = await getCategoryById(productData.categoryId);
          setCategory(categoryData || null);
          document.title = `ModernPaint - ${productData.name}`;
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
        setLoading(false);
      });
  }, [id]);

  const handleViewPDF = () => {
    if (product?.specsPdf) {
      window.open(product.specsPdf, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="container-custom">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              <Skeleton className="aspect-square rounded-lg" />
              <div>
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/4 mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-8" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-8">
        <div className="container-custom">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-gray-500 mb-6">
              The product you are looking for could not be found or has been removed.
            </p>
            <Link to="/products">
              <Button>Browse All Products</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8" dir="rtl">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/products" className="text-brand-blue hover:underline inline-flex items-center">
            <ArrowLeft className="h-4 w-4 ml-1" />
            العودة إلى المنتجات
          </Link>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Image and Gallery */}
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden border border-gray-100 aspect-square">
                {activeMedia && activeMedia.includes('.mp4') ? (
                  <video 
                    src={activeMedia} 
                    className="w-full h-full object-cover" 
                    controls
                  />
                ) : (
                  <img 
                    src={activeMedia || product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Media Gallery */}
              {product.mediaGallery && product.mediaGallery.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setActiveMedia(product.image)}
                    className={`w-16 h-16 rounded border-2 overflow-hidden ${activeMedia === product.image ? 'border-brand-blue' : 'border-gray-200'}`}
                  >
                    <img src={product.image} alt="Main" className="w-full h-full object-cover" />
                  </button>
                  
                  {product.mediaGallery.map((media, index) => (
                    <button 
                      key={index}
                      onClick={() => setActiveMedia(media.url)}
                      className={`w-16 h-16 rounded border-2 overflow-hidden ${activeMedia === media.url ? 'border-brand-blue' : 'border-gray-200'}`}
                    >
                      {media.type === 'video' ? (
                        <div className="w-full h-full relative bg-gray-100 flex items-center justify-center">
                          <Video className="w-8 h-8 text-gray-500" />
                        </div>
                      ) : (
                        <img src={media.url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                <Link 
                  to={`/products?category=${product.categoryId}`}
                  className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full inline-block hover:bg-gray-200 transition-colors"
                >
                  {category?.name}
                </Link>
                <div className="mt-4">
                  <span className="text-2xl font-bold text-brand-blue">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              {/* Color Options */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">الألوان المتوفرة:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="mt-6">
                <Button 
                  size="lg" 
                  className="w-full md:w-auto"
                  onClick={handleViewPDF}
                  disabled={!product.specsPdf}
                >
                  <FileText className="ml-2 h-5 w-5" />
                  عرض ملف المواصفات
                </Button>
              </div>
            </div>
          </div>
          
          {/* Product Details Tabs */}
          <div className="border-t border-gray-100 p-6">
            <Tabs defaultValue="specifications">
              <TabsList className="w-full grid grid-cols-2 max-w-md mx-auto mb-6">
                <TabsTrigger value="specifications">المواصفات</TabsTrigger>
                <TabsTrigger value="usage">الاستخدام والعناية</TabsTrigger>
              </TabsList>
              
              <TabsContent value="specifications" className="p-4">
                {product.specifications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600 w-1/2">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">لا توجد مواصفات متاحة لهذا المنتج.</p>
                )}
              </TabsContent>
              
              <TabsContent value="usage" className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">تحضير السطح</h3>
                    <p className="text-gray-700">
                      تأكد من أن السطح نظيف وجاف وخالي من الطلاء الفضفاض والغبار أو الشحوم.
                      قم بصنفرة الأسطح اللامعة لتحسين الالتصاق. ضع طبقة أساس مناسبة إذا لزم الأمر.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">التطبيق</h3>
                    <p className="text-gray-700">
                      حرك جيدًا قبل الاستخدام. ضع باستخدام فرشاة أو رول أو معدات الرش.
                      للحصول على أفضل النتائج، ضع طبقتين مع السماح بوقت تجفيف كافٍ بين الطبقات.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">التنظيف</h3>
                    <p className="text-gray-700">
                      نظف جميع المعدات مباشرة بعد الاستخدام بالماء للمنتجات ذات الأساس المائي
                      أو المذيب المناسب للمنتجات ذات الأساس المذيب. تخلص من الحاويات الفارغة بشكل مسؤول.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6">الميزات الرئيسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="bg-brand-blue text-white p-1 rounded-full ml-3">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">تغطية ممتازة</h3>
                  <p className="text-sm text-gray-600">
                    يوفر تغطية ممتازة بطبقات أقل، مما يوفر لك الوقت والمال.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="bg-brand-blue text-white p-1 rounded-full ml-3">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">تشطيب طويل الأمد</h3>
                  <p className="text-sm text-gray-600">
                    مصمم لمقاومة البهتان والبقع والتآكل لسنوات من النتائج الجميلة.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="bg-brand-blue text-white p-1 rounded-full ml-3">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">تركيبة منخفضة المركبات العضوية المتطايرة</h3>
                  <p className="text-sm text-gray-600">
                    مسؤولة بيئيًا مع رائحة ضئيلة لبيئة معيشية أكثر صحة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
