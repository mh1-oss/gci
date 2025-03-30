
import { useState, useEffect } from "react";
import { fetchProducts } from "@/services/products/productService";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight } from "lucide-react";
import { Product } from "@/data/initialData";

const CalculatorPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [area, setArea] = useState<number | ''>('');
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const productList = await fetchProducts();
        setProducts(productList);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const calculateQuantity = () => {
    if (!selectedProduct || !area) {
      setResult(null);
      return;
    }

    // Default coverage value if not specified
    const coveragePerLiter = selectedProduct.coverage || 10; 
    const quantityNeeded = area / coveragePerLiter;
    setResult(quantityNeeded);
  };

  return (
    <div className="container-custom py-8" dir="rtl">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">
            <Calculator className="ml-2 inline-block" />
            حساب كمية الطلاء
          </CardTitle>
          <CardDescription>
            أدخل التفاصيل لحساب كمية الطلاء المطلوبة.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="product">المنتج</label>
            <Select onValueChange={value => {
              const product = products.find(p => p.id === value);
              setSelectedProduct(product);
            }}>
              <SelectTrigger id="product">
                <SelectValue placeholder="اختر منتج" />
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
          <div className="grid gap-2">
            <label htmlFor="area">المساحة (متر مربع)</label>
            <Input
              type="number"
              id="area"
              placeholder="أدخل المساحة"
              value={area}
              onChange={(e) => setArea(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <Button onClick={calculateQuantity}>
            <ArrowRight className="ml-2" />
            احسب
          </Button>
          {result !== null && (
            <div className="mt-4">
              <p>
                الكمية المطلوبة:{" "}
                <span className="font-bold">{result.toFixed(2)} لتر</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorPage;
