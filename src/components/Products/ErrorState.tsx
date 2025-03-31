
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const ProductErrorState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container-custom py-12 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">لم يتم العثور على المنتج</h2>
        <p className="text-gray-600 mb-6">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه أو حدث خطأ أثناء تحميل البيانات.</p>
        <div className="space-x-4 rtl:space-x-reverse">
          <Button onClick={() => navigate('/products')}>
            عرض جميع المنتجات
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductErrorState;
