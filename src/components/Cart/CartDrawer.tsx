
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart, CartItem } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, Trash2, ShoppingBag, Edit, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createSaleFromCart } from "@/services/sales/salesService";
import { printReceipt } from "@/services/receipt/receiptService";
import { useQuery } from "@tanstack/react-query";
import { fetchCompanyInfo } from "@/services/company/companyService";
import { CompanyInfo } from "@/data/initialData";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartItemCard = ({ item }: { item: CartItem }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { formatPrice } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(item.quantity);

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setEditQuantity(item.quantity);
  };

  const handleSaveEdit = () => {
    const quantity = parseInt(editQuantity.toString());
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "كمية غير صالحة",
        description: "يجب أن تكون الكمية رقمًا أكبر من 0",
        variant: "destructive",
      });
      return;
    }
    
    updateQuantity(item.id, quantity);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditQuantity(item.quantity);
  };

  return (
    <Card className="mb-3 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          
          <div className="flex flex-1 flex-col">
            <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)}</p>
            
            <div className="mt-2 flex items-center justify-between">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    className="w-16 h-8 text-center"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                  />
                  <Button variant="ghost" size="icon" onClick={handleSaveEdit} className="h-8 w-8">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-100"
                      onClick={handleDecrement}
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      className="p-1 hover:bg-gray-100"
                      onClick={handleIncrement}
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <Button variant="ghost" size="icon" onClick={handleEditToggle} className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="icon" onClick={handleRemove} className="h-8 w-8 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <p className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { formatPrice, currency, setCurrency } = useCurrency();
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
      
      const result = await createSaleFromCart(
        customerName || 'عميل', 
        customerPhone || null, 
        customerEmail || null, 
        items
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col" dir="rtl">
        <SheetHeader className="mb-5">
          <SheetTitle>سلة التسوق</SheetTitle>
          <SheetDescription>
            {totalItems === 0 
              ? "سلة التسوق فارغة"
              : `لديك ${totalItems} ${totalItems === 1 ? 'منتج' : 'منتجات'} في سلة التسوق`
            }
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">سلة التسوق فارغة</p>
            <Button asChild className="mt-4">
              <SheetClose>
                مواصلة التسوق
              </SheetClose>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-1">
              <div className="space-y-1">
                {items.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <div className="mt-6 space-y-4">
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم العميل (اختياري)</label>
                  <Input 
                    className="w-full" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="أدخل اسمك"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف (اختياري)</label>
                  <Input 
                    className="w-full" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="أدخل رقم هاتفك"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني (اختياري)</label>
                  <Input 
                    type="email" 
                    className="w-full" 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                </div>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="font-medium">المجموع:</span>
                <span className="font-bold">{formatPrice(totalPrice)}</span>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mb-2"
                  onClick={toggleCurrency}
                >
                  تغيير العملة: {currency === 'USD' ? 'USD → IQD' : 'IQD → USD'}
                </Button>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? "جاري إتمام الطلب..." : "إتمام الطلب"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearCart}
                >
                  تفريغ السلة
                </Button>
                
                <SheetClose asChild>
                  <Button variant="ghost" className="w-full">
                    مواصلة التسوق
                  </Button>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
