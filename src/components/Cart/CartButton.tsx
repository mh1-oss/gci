
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import CartDrawer from "./CartDrawer";

const CartButton = () => {
  const { totalItems } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  
  return (
    <>
      <Button
        variant="ghost"
        className="relative p-2"
        onClick={() => setCartOpen(true)}
        aria-label="عرض سلة التسوق"
      >
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">
            {totalItems}
          </div>
        )}
      </Button>
      
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
};

export default CartButton;
