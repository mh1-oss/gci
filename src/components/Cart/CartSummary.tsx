
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SheetClose } from "@/components/ui/sheet";

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
  const { totalPrice, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();

  return (
    <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
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
      
      <Button 
        variant="outline" 
        className="w-full border-red-300 hover:bg-red-50 hover:text-red-600"
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
  );
};

export default CartSummary;
