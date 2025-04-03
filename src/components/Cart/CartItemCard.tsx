
import { useState } from "react";
import { useCart, CartItem } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Trash2, Edit, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CartItemCardProps {
  item: CartItem;
}

const CartItemCard = ({ item }: CartItemCardProps) => {
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

export default CartItemCard;
