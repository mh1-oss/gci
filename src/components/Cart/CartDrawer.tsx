
import { useState } from "react";
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
import { Plus, Minus, Trash2, ShoppingBag, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartItemRow = ({ item }: { item: CartItem }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
  };

  return (
    <div className="flex py-4 items-center">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <div className="flex-1 mr-4">
        <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)}</p>
      </div>
      <div className="flex items-center justify-end flex-1">
        <div className="flex items-center border border-gray-300 rounded">
          <button
            type="button"
            className="p-1"
            onClick={handleDecrement}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="px-2 text-sm">{item.quantity}</span>
          <button
            type="button"
            className="p-1"
            onClick={handleIncrement}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <button
          type="button"
          className="mr-4 text-red-500 hover:text-red-700"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const CartDrawer = ({ open, onOpenChange }: CartDrawerProps) => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const printReceipt = () => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      toast({
        title: "تنبيه",
        description: "يرجى السماح بالنوافذ المنبثقة لطباعة الإيصال",
        variant: "destructive"
      });
      return;
    }
    
    const now = new Date();
    
    receiptWindow.document.write(`
      <html dir="rtl">
      <head>
        <title>إيصال مشتريات</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .info-block {
            width: 45%;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          th {
            background-color: #f2f2f2;
          }
          .total {
            text-align: left;
            font-weight: bold;
            font-size: 16px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>إيصال مشتريات</h1>
          <p>تاريخ: ${format(now, 'yyyy/MM/dd hh:mm a', { locale: ar })}</p>
        </div>
        
        <div class="info-section">
          <div class="info-block">
            <h3>معلومات العميل</h3>
            <p><strong>الاسم:</strong> ${customerName || 'عميل'}</p>
            ${customerPhone ? `<p><strong>الهاتف:</strong> ${customerPhone}</p>` : ''}
            ${customerEmail ? `<p><strong>البريد الإلكتروني:</strong> ${customerEmail}</p>` : ''}
          </div>
          <div class="info-block">
            <h3>ملخص المشتريات</h3>
            <p><strong>عدد المنتجات:</strong> ${items.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p><strong>إجمالي المبلغ:</strong> ${totalPrice.toLocaleString()} د.ع</p>
          </div>
        </div>
        
        <h3>المنتجات</h3>
        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString()} د.ع</td>
                <td>${(item.price * item.quantity).toLocaleString()} د.ع</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          الإجمالي: ${totalPrice.toLocaleString()} د.ع
        </div>
        
        <div class="footer">
          <p>شكراً لتعاملكم معنا</p>
          <p>هذا الإيصال دليل على عملية الشراء</p>
        </div>
        
        <button onclick="window.print();" style="display: block; margin: 20px auto; padding: 10px 20px;">
          طباعة الإيصال
        </button>
      </body>
      </html>
    `);
    
    receiptWindow.document.close();
    setTimeout(() => {
      receiptWindow.focus();
      receiptWindow.print();
    }, 500);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    
    // Simulate a checkout process
    setTimeout(() => {
      printReceipt();
      clearCart();
      onOpenChange(false);
      setIsCheckingOut(false);
      
      toast({
        title: "تم الطلب بنجاح",
        description: "تم إرسال طلبك بنجاح وسيتم التواصل معك قريباً",
      });
      
      navigate("/");
    }, 1500);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md" dir="rtl">
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
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1 divide-y">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اسم العميل (اختياري)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="أدخل اسمك"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف (اختياري)</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="أدخل رقم هاتفك"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني (اختياري)</label>
                  <input 
                    type="email" 
                    className="w-full p-2 border rounded" 
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
