
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">سلة التسوق فارغة</h3>
      <p className="text-gray-500 text-center mb-6 max-w-xs">
        لم تقم بإضافة أي منتجات إلى سلة التسوق الخاصة بك بعد. استعرض منتجاتنا وأضف ما تحتاجه.
      </p>
      <Button asChild className="mt-2 bg-primary hover:bg-primary/90">
        <SheetClose>
          مواصلة التسوق
        </SheetClose>
      </Button>
    </div>
  );
};

export default EmptyCart;
