
import { Input } from "@/components/ui/input";

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
      <h3 className="font-medium text-sm mb-2">معلومات العميل</h3>
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
        />
      </div>
    </div>
  );
};

export default CartCustomerInfo;
