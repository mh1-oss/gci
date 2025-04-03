
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { createSaleFromCart } from "@/services/sales/salesService";
import { printReceipt } from "@/services/receipt/receiptService";
import { useQuery } from "@tanstack/react-query";
import { fetchCompanyInfo } from "@/services/company/companyService";
import { CompanyInfo } from "@/data/initialData";

// Import the extracted components
import CartItemCard from "./CartItemCard";
import CartCustomerInfo from "./CartCustomerInfo";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
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
        onOpenChange(false);
        
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

  // If CartDrawer is no longer needed, redirect to the cart page instead
  if (open) {
    navigate("/cart");
    return null;
  }

  // Return an empty fragment since we're redirecting
  return null;
}

export default CartDrawer;
