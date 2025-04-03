
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";

interface CartSummaryProps {
  isCheckingOut: boolean;
  onCheckout: () => Promise<void>;
  onToggleCurrency: () => void;
}

const CartSummary = ({ 
  isCheckingOut, 
  onCheckout,
  onToggleCurrency
}: CartSummaryProps) => {
  const { totalPrice, clearCart, totalItems, items } = useCart();
  const { formatPrice, currency } = useCurrency();

  return (
    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
      <h3 className="font-medium text-sm mb-2">ملخص الطلب</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>عدد المنتجات:</span>
          <span>{totalItems} منتجات</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>إجمالي المنتجات:</span>
          <span>{items.reduce((sum, item) => sum + item.quantity, 0)} قطعة</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>العملة المستخدمة:</span>
          <span dir="ltr">{currency === 'USD' ? 'دولار أمريكي ($)' : 'دينار عراقي (IQD)'}</span>
        </div>
      </div>
      
      <Separator className="my-2" />
      
      <div className="flex justify-between py-2">
        <span className="font-medium">المجموع:</span>
        <span className="font-bold text-primary">{formatPrice(totalPrice)}</span>
      </div>

      <div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mb-2 text-sm"
          onClick={onToggleCurrency}
        >
          تغيير العملة: {currency === 'USD' ? 'USD → IQD' : 'IQD → USD'}
        </Button>
      </div>
      
      <Button 
        className="w-full bg-primary hover:bg-primary/90" 
        onClick={onCheckout}
        disabled={isCheckingOut}
      >
        {isCheckingOut ? "جاري إتمام الطلب..." : "إتمام الطلب"}
      </Button>
      
      {totalItems > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
          <AlertTriangle className="h-3 w-3" />
          <span>سيتم إرسال الطلب مباشرة عند النقر على زر إتمام الطلب</span>
        </div>
      )}
      
      <Button 
        variant="outline" 
        className="w-full border-red-300 hover:bg-red-50 hover:text-red-600"
        onClick={clearCart}
      >
        تفريغ السلة
      </Button>
      
      <Button 
        variant="ghost" 
        className="w-full"
        onClick={() => window.history.back()}
      >
        مواصلة التسوق
      </Button>
    </div>
  );
};

export default CartSummary;
