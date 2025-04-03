
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
      <p className="text-gray-500 text-center mb-4">سلة التسوق فارغة</p>
      <Button asChild className="mt-2 bg-primary hover:bg-primary/90">
        <SheetClose>
          مواصلة التسوق
        </SheetClose>
      </Button>
    </div>
  );
};

export default EmptyCart;
