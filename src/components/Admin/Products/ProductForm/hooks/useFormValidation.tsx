
import { useToast } from '@/hooks/use-toast';

interface FormData {
  name: string;
  price: number;
}

export const useFormValidation = () => {
  const { toast } = useToast();
  
  const validateForm = (formData: FormData) => {
    if (!formData.name.trim()) {
      toast({
        title: "حقل مطلوب",
        description: "الرجاء إدخال اسم المنتج",
        variant: "destructive"
      });
      return false;
    }
    
    if (formData.price <= 0) {
      toast({
        title: "قيمة غير صالحة",
        description: "الرجاء إدخال سعر صالح للمنتج",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  return { validateForm };
};
