
import { useState, useEffect, useRef } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { getCategories, getProducts } from "@/services/dataService";
import { Product, Category } from "@/data/initialData";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, RefreshCw, Download, ArrowUp } from "lucide-react";

const VisualizerPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isApplyingColor, setIsApplyingColor] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    document.title = "مودرن بينت - محاكي الألوان";
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
        
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Update available products when category changes
  useEffect(() => {
    if (selectedCategory) {
      const categoryProducts = products.filter(p => p.categoryId === selectedCategory);
      if (categoryProducts.length > 0) {
        setSelectedProduct(categoryProducts[0]);
        if (categoryProducts[0].colors && categoryProducts[0].colors.length > 0) {
          setSelectedColor(categoryProducts[0].colors[0]);
        } else {
          setSelectedColor(null);
        }
      } else {
        setSelectedProduct(null);
        setSelectedColor(null);
      }
    }
  }, [selectedCategory, products]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle color application
  const applyColorToImage = () => {
    if (!uploadedImage || !selectedColor) return;
    
    setIsApplyingColor(true);
    
    // Simulate color application with a delay
    setTimeout(() => {
      // Color application would typically involve more complex image processing
      // This is just a simplified simulation
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      
      if (canvas && ctx) {
        const img = new Image();
        img.onload = () => {
          // Resize canvas to match image
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw original image
          ctx.drawImage(img, 0, 0);
          
          // Apply a color overlay - this is simplified
          // In a real app, you'd use more sophisticated techniques
          ctx.globalAlpha = 0.3; // Transparency
          ctx.fillStyle = selectedColor === "أبيض" ? "#FFFFFF" : 
                         selectedColor === "أسود" ? "#000000" :
                         selectedColor === "أحمر" ? "#FF0000" :
                         selectedColor === "أزرق" ? "#0000FF" :
                         selectedColor === "أخضر" ? "#00FF00" :
                         selectedColor === "رمادي" ? "#808080" :
                         selectedColor === "بيج" ? "#F5F5DC" :
                         selectedColor === "بني" ? "#A52A2A" :
                         selectedColor === "فضي" ? "#C0C0C0" :
                         "#FF69B4"; // Default pink
          
          // Only apply to walls - this would need more sophisticated object detection in a real app
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Reset alpha
          ctx.globalAlpha = 1.0;
          
          setIsApplyingColor(false);
        };
        img.src = uploadedImage;
      }
    }, 1500); // Simulate processing time
  };

  // Reset the visualizer
  const resetVisualizer = () => {
    setUploadedImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Download the processed image
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `modern-paint-${selectedProduct?.name}-${selectedColor}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Filtered products by selected category
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.categoryId === selectedCategory)
    : [];

  return (
    <div className="py-10" dir="rtl">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">محاكي الألوان</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            استخدم أداة محاكاة الألوان لرؤية كيف ستبدو منتجاتنا في منزلك قبل الشراء. 
            ما عليك سوى تحميل صورة وتحديد اللون ومشاهدة التحويل.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>اختر المنتج واللون</CardTitle>
              <CardDescription>
                حدد فئة المنتج ثم المنتج واللون لتطبيقه
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                </div>
              ) : (
                <>
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">فئة المنتج</label>
                    <Select
                      value={selectedCategory || ''}
                      onValueChange={(value) => setSelectedCategory(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر فئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">المنتج</label>
                    <Select
                      value={selectedProduct?.id || ''}
                      onValueChange={(value) => {
                        const product = products.find(p => p.id === value);
                        setSelectedProduct(product || null);
                        if (product?.colors && product.colors.length > 0) {
                          setSelectedColor(product.colors[0]);
                        }
                      }}
                      disabled={filteredProducts.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر منتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Color Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">اللون</label>
                    <Select
                      value={selectedColor || ''}
                      onValueChange={setSelectedColor}
                      disabled={!selectedProduct || !selectedProduct.colors || selectedProduct.colors.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر لون" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProduct?.colors?.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Upload Image */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">تحميل صورة</label>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center justify-center w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 cursor-pointer rounded-md transition-colors">
                          <Camera className="h-5 w-5 ml-2" />
                          <span>اختر صورة</span>
                          <input 
                            ref={imageInputRef}
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        قم بتحميل صورة للغرفة التي ترغب في رؤية اللون فيها
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    <Button 
                      className="w-full" 
                      onClick={applyColorToImage}
                      disabled={!uploadedImage || !selectedColor || isApplyingColor}
                    >
                      {isApplyingColor ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري التطبيق...
                        </>
                      ) : (
                        "تطبيق اللون"
                      )}
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={resetVisualizer}
                        disabled={!uploadedImage}
                      >
                        <RefreshCw className="ml-2 h-4 w-4" />
                        إعادة تعيين
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={downloadImage}
                        disabled={!uploadedImage || isApplyingColor}
                      >
                        <Download className="ml-2 h-4 w-4" />
                        تحميل
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  {selectedProduct && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-medium text-lg mb-2">{selectedProduct.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{selectedProduct.description}</p>
                      <p className="font-bold">{formatPrice(selectedProduct.price)}</p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-brand-blue"
                        onClick={() => window.location.href = `/products/${selectedProduct.id}`}
                      >
                        عرض تفاصيل المنتج
                        <ArrowUp className="mr-1 h-3 w-3 rotate-45" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Visualization Area */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>معاينة التطبيق</CardTitle>
                <CardDescription>
                  انظر كيف سيبدو اللون المحدد في صورتك
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center">
                {!uploadedImage ? (
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg w-full">
                    <div className="flex flex-col items-center">
                      <Camera className="h-10 w-10 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">قم بتحميل صورة</h3>
                      <p className="text-gray-500 mb-4">قم بتحميل صورة لمشاهدة محاكاة اللون</p>
                      <label className="flex items-center justify-center py-2 px-4 bg-brand-blue text-white rounded-md cursor-pointer hover:bg-brand-darkblue transition-colors">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        تحميل صورة
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    {isApplyingColor ? (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10 rounded-md">
                        <div className="text-center text-white">
                          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                          <p>جاري تطبيق اللون...</p>
                        </div>
                      </div>
                    ) : null}
                    <canvas 
                      ref={canvasRef} 
                      className="max-w-full max-h-[60vh] mx-auto border rounded-md object-contain"
                    />
                    {!isApplyingColor && (
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded room" 
                        className="max-w-full max-h-[60vh] mx-auto border rounded-md object-contain"
                        style={{ display: canvasRef.current?.getContext('2d') ? 'none' : 'block' }}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Integration notice */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            للحصول على تجربة محاكاة أكثر تقدمًا، يمكنك زيارة 
            <a 
              href="https://gcipaint.com/ar/pages/other/visualizer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-brand-blue hover:underline mx-1"
            >
              محاكي الألوان الخاص بنا
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VisualizerPage;
