
import { useState, useEffect, useRef } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { fetchCompanyInfo, updateCompanyInfo } from "@/services/company/companyService";
import { CompanyInfo } from "@/data/initialData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, X } from "lucide-react";

const AdminSettings = () => {
  const { exchangeRate, setExchangeRate } = useCurrency();
  const [tempExchangeRate, setTempExchangeRate] = useState(exchangeRate.toString());
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const info = await fetchCompanyInfo();
        setCompanyInfo(info);
        setLogoPreview(info.logo);
      } catch (error) {
        console.error("Error fetching company info:", error);
        toast({
          title: "خطأ",
          description: "فشل في تحميل معلومات الشركة.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  useEffect(() => {
    setTempExchangeRate(exchangeRate.toString());
  }, [exchangeRate]);

  const handleExchangeRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate = parseFloat(tempExchangeRate);
    
    if (isNaN(newRate) || newRate <= 0) {
      toast({
        title: "معدل غير صالح",
        description: "يرجى إدخال رقم موجب صالح لمعدل الصرف.",
        variant: "destructive",
      });
      return;
    }
    
    setExchangeRate(newRate);
    toast({
      title: "تم تحديث معدل الصرف",
      description: `تم تعيين سعر الصرف إلى 1 دولار أمريكي = ${newRate} دينار عراقي.`,
      variant: "default",
    });
  };

  const handleCompanyInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInfo) return;
    
    try {
      setSaving(true);
      await updateCompanyInfo(companyInfo);
      toast({
        title: "تم تحديث معلومات الشركة",
        description: "تم تحديث معلومات الشركة بنجاح.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating company info:", error);
      toast({
        title: "خطأ",
        description: "فشل تحديث معلومات الشركة.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        if (companyInfo) {
          setCompanyInfo({
            ...companyInfo,
            logo: result
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearLogoSelection = () => {
    if (companyInfo) {
      setLogoPreview("/gci-logo.png");
      setCompanyInfo({
        ...companyInfo,
        logo: "/gci-logo.png"
      });
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  const updateCompanyField = (
    field: string, 
    value: string, 
    isNested: boolean = false, 
    nestedField?: string, 
    deepNested?: boolean,
    deepNestedField?: string
  ) => {
    if (!companyInfo) return;
    
    if (!isNested) {
      setCompanyInfo({
        ...companyInfo,
        [field]: value,
      });
    } else if (isNested && nestedField) {
      const currentFieldValue = companyInfo[field as keyof CompanyInfo];
      
      if (typeof currentFieldValue === 'object' && currentFieldValue !== null) {
        if (!deepNested) {
          setCompanyInfo({
            ...companyInfo,
            [field]: {
              ...currentFieldValue,
              [nestedField]: value,
            },
          });
        } else if (deepNested && deepNestedField) {
          const nestedValue = (currentFieldValue as any)[nestedField];
          
          if (typeof nestedValue === 'object' && nestedValue !== null) {
            setCompanyInfo({
              ...companyInfo,
              [field]: {
                ...currentFieldValue,
                [nestedField]: {
                  ...nestedValue,
                  [deepNestedField]: value,
                },
              },
            });
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div dir="rtl">
      <h2 className="text-2xl font-bold mb-6">الإعدادات</h2>
      
      <Tabs defaultValue="currency" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="currency">إعدادات العملة</TabsTrigger>
          <TabsTrigger value="company">معلومات الشركة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات العملة</CardTitle>
              <CardDescription>
                تحديث سعر الصرف بين الدولار الأمريكي والدينار العراقي. هذا يؤثر على كيفية عرض الأسعار في جميع أنحاء الموقع.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExchangeRateSubmit} id="exchange-rate-form">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="exchange-rate" className="block text-sm font-medium text-gray-700 mb-1">
                      سعر الصرف (1 دولار أمريكي إلى الدينار العراقي)
                    </label>
                    <div className="flex">
                      <Input
                        id="exchange-rate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={tempExchangeRate}
                        onChange={(e) => setTempExchangeRate(e.target.value)}
                        className="rounded-r-none"
                      />
                      <div className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 flex items-center rounded-r-md">
                        دينار عراقي
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      السعر الحالي: 1 دولار أمريكي = {exchangeRate} دينار عراقي
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="exchange-rate-form">
                تحديث سعر الصرف
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="company">
          {companyInfo && (
            <Card>
              <CardHeader>
                <CardTitle>معلومات الشركة</CardTitle>
                <CardDescription>
                  تحديث تفاصيل شركتك التي تظهر في جميع أنحاء الموقع.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompanyInfoSubmit} id="company-info-form">
                  <div className="space-y-6">
                    {/* Logo Upload */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">شعار الشركة</h3>
                      <div className="flex flex-col space-y-4">
                        <div className="flex justify-center">
                          <div className="relative w-32 h-32 border border-gray-300 rounded-md overflow-hidden">
                            {logoPreview && (
                              <img 
                                src={logoPreview} 
                                alt="شعار الشركة" 
                                className="w-full h-full object-contain"
                              />
                            )}
                            <button 
                              type="button" 
                              onClick={clearLogoSelection}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <label htmlFor="logo-upload" className="cursor-pointer">
                            <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors">
                              <Upload className="h-4 w-4 ml-2" />
                              <span>تحميل شعار جديد</span>
                            </div>
                            <input 
                              id="logo-upload" 
                              type="file" 
                              accept="image/*" 
                              ref={logoInputRef}
                              onChange={handleLogoChange} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">المعلومات الأساسية</h3>
                      
                      <div>
                        <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                          اسم الشركة
                        </label>
                        <Input
                          id="company-name"
                          value={companyInfo.name}
                          onChange={(e) => updateCompanyField("name", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company-slogan" className="block text-sm font-medium text-gray-700 mb-1">
                          شعار الشركة
                        </label>
                        <Input
                          id="company-slogan"
                          value={companyInfo.slogan}
                          onChange={(e) => updateCompanyField("slogan", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company-about" className="block text-sm font-medium text-gray-700 mb-1">
                          عن الشركة
                        </label>
                        <Textarea
                          id="company-about"
                          value={companyInfo.about}
                          onChange={(e) => updateCompanyField("about", e.target.value)}
                          rows={5}
                        />
                      </div>
                    </div>
                    
                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">معلومات الاتصال</h3>
                      
                      <div>
                        <label htmlFor="company-address" className="block text-sm font-medium text-gray-700 mb-1">
                          العنوان
                        </label>
                        <Input
                          id="company-address"
                          value={companyInfo.contact.address}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "address")}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company-email" className="block text-sm font-medium text-gray-700 mb-1">
                          البريد الإلكتروني
                        </label>
                        <Input
                          id="company-email"
                          type="email"
                          value={companyInfo.contact.email}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "email")}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700 mb-1">
                          رقم الهاتف
                        </label>
                        <Input
                          id="company-phone"
                          value={companyInfo.contact.phone}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "phone")}
                        />
                      </div>
                    </div>
                    
                    {/* Social Media */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">وسائل التواصل الاجتماعي</h3>
                      
                      <div>
                        <label htmlFor="social-facebook" className="block text-sm font-medium text-gray-700 mb-1">
                          رابط فيسبوك
                        </label>
                        <Input
                          id="social-facebook"
                          value={companyInfo.contact.socialMedia.facebook}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "socialMedia", true, "facebook")}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="social-instagram" className="block text-sm font-medium text-gray-700 mb-1">
                          رابط انستغرام
                        </label>
                        <Input
                          id="social-instagram"
                          value={companyInfo.contact.socialMedia.instagram}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "socialMedia", true, "instagram")}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="social-twitter" className="block text-sm font-medium text-gray-700 mb-1">
                          رابط تويتر
                        </label>
                        <Input
                          id="social-twitter"
                          value={companyInfo.contact.socialMedia.twitter}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "socialMedia", true, "twitter")}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button type="submit" form="company-info-form" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ التغييرات"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
