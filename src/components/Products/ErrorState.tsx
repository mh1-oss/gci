
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ProductErrorState = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container-custom py-12 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">لم يتم العثور على المنتج</h2>
      <p className="text-gray-600 mb-6">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
      <Button onClick={() => navigate('/products')}>
        العودة إلى المنتجات
      </Button>
    </div>
  );
};

export default ProductErrorState;
