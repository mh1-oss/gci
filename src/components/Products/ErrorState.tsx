
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Search } from "lucide-react";

const ProductErrorState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container-custom py-12 text-center">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ في تحميل المنتج</h2>
        <p className="text-gray-600 mb-6">
          حدث خطأ أثناء محاولة تحميل بيانات المنتج
          <br />
          <span className="text-sm text-gray-500 block mt-2">تأكد من الرابط أو حاول مرة أخرى.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={() => navigate('/products')} 
            className="w-full sm:w-auto"
          >
            <Search className="ml-2 h-4 w-4" />
            عرض جميع المنتجات
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            العودة للصفحة السابقة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductErrorState;
