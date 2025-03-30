
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
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  const handleCheckout = () => {
    setIsCheckingOut(true);
    
    // In a real app, this would navigate to a checkout page
    // For demo purposes, we'll simulate a checkout process
    setTimeout(() => {
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

            <SheetFooter className="flex-col items-stretch gap-2 sm:items-stretch mt-6">
              <Separator className="my-4" />
              
              <div className="flex justify-between py-2">
                <span className="font-medium">المجموع:</span>
                <span className="font-bold">{formatPrice(totalPrice)}</span>
              </div>
              
              <div className="space-y-2 pt-4">
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
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
