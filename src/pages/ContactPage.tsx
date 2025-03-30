import { useState, useEffect } from "react";
import { fetchCompanyInfo } from "@/services/company/companyService";
import { CompanyInfo } from "@/data/initialData";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const ContactPage = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    slogan: '',
    about: '',
    logo: '',
    contact: {
      address: '',
      phone: '',
      email: '',
      socialMedia: {}
    },
    exchangeRate: 1
  });

  const { toast } = useToast();

  useEffect(() => {
    document.title = "اتصل بنا - الشركة الذهبية للصناعات الكيمياوية";
    
    const fetchCompanyInfo = async () => {
      const info = await fetchCompanyInfo();
      if (info) {
        setCompanyInfo({
          ...info,
          exchangeRate: info.exchangeRate || 1
        });
      }
    };
    
    fetchCompanyInfo();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Message sent",
      description: "Thank you for your message. We'll get back to you soon!",
      variant: "default",
    });
    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  if (!companyInfo) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">اتصل بنا</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نحن هنا لرد أي أسئلة لديك عن منتجاتنا وخدماتنا.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">ارسل لنا رسالة</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم الكامل
                  </label>
                  <Input 
                    id="name" 
                    name="name" 
                    type="text" 
                    required 
                    placeholder="اسمك الكامل"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    عنوان البريد الإلكتروني
                  </label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="عنوان بريدك الإلكتروني"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  الموضوع
                </label>
                <Input 
                  id="subject" 
                  name="subject" 
                  type="text" 
                  required 
                  placeholder="ما يتعلق هذا بالفعل؟"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  الرسالة
                </label>
                <Textarea 
                  id="message" 
                  name="message" 
                  rows={5} 
                  required 
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>
              
              <Button type="submit" className="w-full">
                ارسل رسالة
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-6">اتصل بنا</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-brand-blue text-white p-2 rounded-full mr-4">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">عنواننا</h3>
                    <p className="text-gray-600">{companyInfo.contact.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-brand-blue text-white p-2 rounded-full mr-4">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">رقم الهاتف</h3>
                    <p className="text-gray-600">{companyInfo.contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-brand-blue text-white p-2 rounded-full mr-4">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">عنوان البريد الإلكتروني</h3>
                    <p className="text-gray-600">{companyInfo.contact.email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold mb-3">ساعات العمل</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">الإثنين - الجمعة</span>
                  <span>9:00 صباحاً - 6:00 مساءً</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">السبت</span>
                  <span>10:00 صباحاً - 4:00 مساءً</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الأحد</span>
                  <span>مغلق</span>
                </div>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-3">تابعنا</h3>
              <div className="flex space-x-4">
                <a 
                  href={companyInfo.contact.socialMedia.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-gray-700 hover:bg-brand-blue hover:text-white transition-colors p-3 rounded-full"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href={companyInfo.contact.socialMedia.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-gray-700 hover:bg-brand-blue hover:text-white transition-colors p-3 rounded-full"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href={companyInfo.contact.socialMedia.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-gray-700 hover:bg-brand-blue hover:text-white transition-colors p-3 rounded-full"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="mt-12 rounded-lg overflow-hidden shadow-sm h-[400px] bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">سيتم إضافة الخريطة هنا في البيئة الإنتاجية</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
