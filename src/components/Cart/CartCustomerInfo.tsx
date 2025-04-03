
import { Input } from "@/components/ui/input";
import { InfoIcon } from "lucide-react";

interface CartCustomerInfoProps {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerEmail: (email: string) => void;
}

const CartCustomerInfo = ({
  customerName,
  customerPhone,
  customerEmail,
  setCustomerName,
  setCustomerPhone,
  setCustomerEmail
}: CartCustomerInfoProps) => {
  return (
    <div className="space-y-4 bg-muted/20 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm mb-2">معلومات العميل</h3>
        <div className="inline-flex items-center text-xs text-muted-foreground">
          <InfoIcon className="h-3 w-3 mr-1" />
          <span>سيتم استخدام هذه المعلومات للتواصل والفاتورة</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">اسم العميل (اختياري)</label>
        <Input 
          className="w-full" 
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="أدخل اسمك"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">رقم الهاتف (اختياري)</label>
        <Input 
          className="w-full" 
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="أدخل رقم هاتفك"
          type="tel"
          dir="ltr"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">البريد الإلكتروني (اختياري)</label>
        <Input 
          type="email" 
          className="w-full" 
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="أدخل بريدك الإلكتروني"
          dir="ltr"
        />
      </div>
    </div>
  );
};

export default CartCustomerInfo;
