
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { createSaleFromCart } from "@/services/sales/salesService";
import { printReceipt } from "@/services/receipt/receiptService";
import { useQuery } from "@tanstack/react-query";
import { fetchCompanyInfo } from "@/services/company/companyService";
import { CompanyInfo } from "@/data/initialData";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Import the extracted components
import CartItemCard from "@/components/Cart/CartItemCard";
import CartCustomerInfo from "@/components/Cart/CartCustomerInfo";
import CartSummary from "@/components/Cart/CartSummary";
import EmptyCart from "@/components/Cart/EmptyCart";

const CartPage = () => {
  const { items, totalItems, clearCart } = useCart();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  const { data: fetchedCompanyInfo } = useQuery({
    queryKey: ['companyInfo'],
    queryFn: fetchCompanyInfo
  });

  useEffect(() => {
    if (fetchedCompanyInfo) {
      setCompanyInfo(fetchedCompanyInfo);
    }
  }, [fetchedCompanyInfo]);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    
    try {
      if (items.length === 0) {
        toast({
          title: "سلة التسوق فارغة",
          description: "لا يمكن إكمال الطلب بدون منتجات",
          variant: "destructive",
        });
        setIsCheckingOut(false);
        return;
      }
      
      // Save current cart items to preserve their price in current currency
      const cartItems = [...items];
      
      const result = await createSaleFromCart(
        customerName || 'عميل', 
        customerPhone || null, 
        customerEmail || null, 
        cartItems
      );
      
      if (result.success && result.saleData) {
        try {
          if (companyInfo) {
            printReceipt(result.saleData, companyInfo);
          } else {
            printReceipt(result.saleData);
          }
        } catch (printError) {
          console.error("Error printing receipt:", printError);
          toast({
            title: "تنبيه",
            description: "تم إتمام الطلب ولكن حدث خطأ أثناء طباعة الإيصال",
            variant: "default",
          });
        }
        
        clearCart();
        
        toast({
          title: "تم الطلب بنجاح",
          description: "تم إرسال طلبك بنجاح وسيتم التواصل معك قريباً",
        });
        
        navigate("/");
      } else {
        toast({
          title: "خطأ",
          description: result.error || "حدث خطأ أثناء إتمام الطلب",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ غير متوقع أثناء إتمام الطلب",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'USD' ? 'IQD' : 'USD');
    toast({
      title: "تم تغيير العملة",
      description: `تم تغيير العملة إلى ${currency === 'USD' ? 'الدينار العراقي' : 'الدولار الأمريكي'}`,
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">سلة التسوق</h1>
          <p className="text-muted-foreground">
            {totalItems === 0 
              ? "سلة التسوق فارغة"
              : `لديك ${totalItems} ${totalItems === 1 ? 'منتج' : 'منتجات'} في سلة التسوق`
            }
          </p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للتسوق
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <EmptyCart />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-medium mb-4">منتجات السلة</h2>
            <div className="mb-4 max-h-[70vh]">
              <ScrollArea className="h-full pr-1">
                <div className="space-y-3 p-1">
                  {items.map((item) => (
                    <CartItemCard key={item.id} item={item} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <CartCustomerInfo
                customerName={customerName}
                customerPhone={customerPhone}
                customerEmail={customerEmail}
                setCustomerName={setCustomerName}
                setCustomerPhone={setCustomerPhone}
                setCustomerEmail={setCustomerEmail}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4">
              <CartSummary
                isCheckingOut={isCheckingOut}
                onCheckout={handleCheckout}
                onToggleCurrency={toggleCurrency}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
