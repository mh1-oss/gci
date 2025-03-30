import { useState, useEffect } from "react";
import { fetchProducts } from "@/services/products/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator as CalcIcon } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

const CalculatorPage = () => {
  const [area, setArea] = useState<number>(0);
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [doors, setDoors] = useState<string>("0");
  const [windows, setWindows] = useState<string>("0");
  const [coats, setCoats] = useState<string>("2");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [result, setResult] = useState<{ liters: number; cans: { size: number; count: number }[] } | null>(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    document.title = "GSI - حاسبة الطلاء";
    fetchProducts().then(setProducts);
  }, []);

  useEffect(() => {
    if (length && width) {
      const floorArea = parseFloat(length) * parseFloat(width);
      
      if (height) {
        const wallArea = 2 * (parseFloat(length) * parseFloat(height) + parseFloat(width) * parseFloat(height));
        const doorArea = parseInt(doors) * 2;
        const windowArea = parseInt(windows) * 1.5;
        setArea(wallArea - doorArea - windowArea);
      } else {
        setArea(floorArea);
      }
    } else {
      setArea(0);
    }
  }, [length, width, height, doors, windows]);

  const calculatePaint = () => {
    if (!selectedProductId || area <= 0) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    const coveragePerLiter = product.specifications?.["التغطية"] 
      ? parseFloat(product.specifications["التغطية"].split("-")[0]) 
      : 10;
    
    const numberOfCoats = parseInt(coats);
    const totalLiters = (area * numberOfCoats) / coveragePerLiter;
    
    const canSizes = [10, 4, 1];
    let remainingLiters = totalLiters;
    const cans: { size: number; count: number }[] = [];
    
    canSizes.forEach(size => {
      if (remainingLiters >= size) {
        const count = Math.floor(remainingLiters / size);
        cans.push({ size, count });
        remainingLiters -= count * size;
      }
    });
    
    if (remainingLiters > 0) {
      cans.push({ size: 1, count: 1 });
    }
    
    setResult({
      liters: totalLiters,
      cans
    });
  };

  const resetCalculator = () => {
    setLength("");
    setWidth("");
    setHeight("");
    setDoors("0");
    setWindows("0");
    setCoats("2");
    setSelectedProductId("");
    setResult(null);
  };

  return (
    <div className="py-12" dir="rtl">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">حاسبة الطلاء</h1>
            <p className="text-gray-600">
              حاسبة طلاء GSI تساعدك على تحديد كمية الطلاء التي ستحتاجها لمشروعك
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>أدخل المعلومات</CardTitle>
                <CardDescription>
                  أدخل أبعاد المساحة التي ترغب في طلائها
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="calc-type" className="mb-2 block">نوع السطح</Label>
                  <Select onValueChange={(value) => {
                    if (value === "walls") {
                      setHeight("");
                    } else {
                      setHeight("0");
                      setDoors("0");
                      setWindows("0");
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع السطح" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="walls">الجدران</SelectItem>
                      <SelectItem value="ceiling">السقف</SelectItem>
                      <SelectItem value="floor">الأرضية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="length" className="mb-2 block">الطول (متر)</Label>
                    <Input 
                      id="length" 
                      type="number" 
                      min="0" 
                      step="0.1" 
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="width" className="mb-2 block">العرض (متر)</Label>
                    <Input 
                      id="width" 
                      type="number" 
                      min="0" 
                      step="0.1"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                    />
                  </div>
                </div>
                
                {height !== "0" && (
                  <div>
                    <Label htmlFor="height" className="mb-2 block">الارتفاع (متر)</Label>
                    <Input 
                      id="height" 
                      type="number" 
                      min="0" 
                      step="0.1"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                )}
                
                {height !== "0" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="doors" className="mb-2 block">عدد الأبواب</Label>
                      <Input 
                        id="doors" 
                        type="number" 
                        min="0"
                        value={doors}
                        onChange={(e) => setDoors(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="windows" className="mb-2 block">عدد النوافذ</Label>
                      <Input 
                        id="windows" 
                        type="number" 
                        min="0"
                        value={windows}
                        onChange={(e) => setWindows(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="coats" className="mb-2 block">عدد الطبقات</Label>
                  <Select onValueChange={setCoats} defaultValue="2">
                    <SelectTrigger>
                      <SelectValue placeholder="اختر عدد الطبقات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="product" className="mb-2 block">المنتج</Label>
                  <Select onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المنتج" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={resetCalculator}>
                  إعادة تعيين
                </Button>
                <Button onClick={calculatePaint} disabled={!selectedProductId || area <= 0}>
                  <CalcIcon className="ml-2 h-4 w-4" />
                  حساب الكمية
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>النتائج</CardTitle>
                <CardDescription>
                  كمية الطلاء المطلوبة لمشروعك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">المساحة الكلية</p>
                    <p className="text-xl font-semibold">{area.toFixed(2)} متر مربع</p>
                  </div>
                  
                  {result && (
                    <>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">كمية الطلاء المطلوبة</p>
                        <p className="text-xl font-semibold">{result.liters.toFixed(2)} لتر</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">العبوات المقترحة</p>
                        <ul className="space-y-2 mt-2">
                          {result.cans.map((can, index) => (
                            <li key={index} className="flex justify-between">
                              <span>عبوة {can.size} لتر</span>
                              <span className="font-semibold">{can.count} قطعة</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {selectedProductId && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500 mb-1">المنتج المختار</p>
                          <div className="flex items-center mt-2">
                            <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-3">
                              <img 
                                src={products.find(p => p.id === selectedProductId)?.image || "/placeholder.svg"} 
                                alt="المنتج" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{products.find(p => p.id === selectedProductId)?.name}</p>
                              <p className="text-sm text-gray-500">
                                {formatPrice(products.find(p => p.id === selectedProductId)?.price || 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  ملاحظة: هذه الحسابات تقديرية وقد تختلف حسب طريقة التطبيق وحالة السطح.
                </p>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">نصائح للطلاء</h2>
            <ul className="space-y-2 list-disc list-inside text-gray-700">
              <li>تأكد من تنظيف وتجهيز السطح جيدًا قبل الطلاء.</li>
              <li>استخدم طبقة أساس للأسطح الجديدة أو المسامية.</li>
              <li>انتظر حتى تجف الطبقة الأولى تمامًا قبل وضع الطبقة الثانية.</li>
              <li>للحصول على نتائج أفضل، استخدم أدوات طلاء عالية الجودة.</li>
              <li>اشتري كمية إضافية من الطلاء للتصحيحات المستقبلية.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
