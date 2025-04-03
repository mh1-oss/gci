
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
    <Card className="mb-3 overflow-hidden border border-border">
      <CardContent className="p-3">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          
          <div className="flex flex-1 flex-col">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
              <p className="font-medium text-primary">{formatPrice(item.price * item.quantity)}</p>
            </div>
            
            <div className="mt-1 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">سعر الوحدة: {formatPrice(item.price)}</p>
              <p className="text-sm text-muted-foreground">المعرف: {item.id.substring(0, 8)}...</p>
            </div>
            
            <div className="mt-2 flex items-center justify-between">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    className="w-20 h-9 text-center"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                  />
                  <Button variant="outline" size="icon" onClick={handleSaveEdit} className="h-8 w-8 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleCancelEdit} className="h-8 w-8 bg-red-50">
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      type="button"
                      className="p-1 px-2 hover:bg-gray-100"
                      onClick={handleDecrement}
                      aria-label="تقليل الكمية"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      className="p-1 px-2 hover:bg-gray-100"
                      onClick={handleIncrement}
                      aria-label="زيادة الكمية"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <Button variant="ghost" size="sm" onClick={handleEditToggle} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={handleRemove} className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItemCard;
