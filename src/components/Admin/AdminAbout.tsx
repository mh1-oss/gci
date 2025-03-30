
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";
import { fetchCompanyInfo, updateCompanyInfo } from "@/services/company/companyService";
import { uploadMedia } from "@/services/media/mediaService";
import { CompanyInfo } from "@/data/initialData";

const AdminAbout = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const info = await fetchCompanyInfo();
        console.log("Fetched company info:", info);
        
        if (info) {
          setCompanyInfo(info);
          setLogoPreview(info.logo);
        } else {
          // Set default values if no info is found
          setCompanyInfo({
            name: 'شركة الذهبية للصناعات الكيمياوية',
            slogan: 'جودة تدوم مع الوقت',
            about: '',
            logo: '/gci-logo.png',
            contact: {
              address: '',
              phone: '',
              email: '',
              socialMedia: {}
            },
            exchangeRate: 1
          });
          setLogoPreview('/gci-logo.png');
        }
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

  const handleAboutChange = (value: string) => {
    if (companyInfo) {
      setCompanyInfo({
        ...companyInfo,
        about: value
      });
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const logoUrl = await uploadMedia(file);
        if (companyInfo && logoUrl) {
          setCompanyInfo({
            ...companyInfo,
            logo: logoUrl
          });
          setLogoPreview(logoUrl);
          
          toast({
            title: "تم تحميل الشعار",
            description: "تم تحميل شعار الشركة بنجاح.",
          });
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
        toast({
          title: "خطأ",
          description: "فشل في تحميل شعار الشركة.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSave = async () => {
    if (!companyInfo) return;
    
    try {
      setSaving(true);
      const success = await updateCompanyInfo(companyInfo);
      
      if (success) {
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث معلومات الشركة.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to update company info");
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div dir="rtl">
      <h2 className="text-2xl font-bold mb-6">تعديل صفحة من نحن</h2>
      
      {companyInfo && (
        <Card>
          <CardHeader>
            <CardTitle>معلومات الشركة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                اسم الشركة
              </label>
              <Input
                id="company-name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="company-slogan" className="block text-sm font-medium text-gray-700 mb-1">
                شعار الشركة
              </label>
              <Input
                id="company-slogan"
                value={companyInfo.slogan}
                onChange={(e) => setCompanyInfo({...companyInfo, slogan: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                شعار الشركة (الصورة)
              </label>
              <div className="flex flex-col space-y-4">
                {logoPreview && (
                  <div className="relative w-32 h-32 border border-gray-300 rounded-md overflow-hidden">
                    <img 
                      src={logoPreview} 
                      alt="شعار الشركة" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors">
                      <Upload className="h-4 w-4 ml-2" />
                      <span>تحميل شعار جديد</span>
                    </div>
                    <input 
                      id="logo-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="company-about" className="block text-sm font-medium text-gray-700 mb-1">
                عن الشركة
              </label>
              <Textarea
                id="company-about"
                value={companyInfo.about}
                onChange={(e) => handleAboutChange(e.target.value)}
                rows={10}
              />
            </div>
            
            <div>
              <label htmlFor="contact-address" className="block text-sm font-medium text-gray-700 mb-1">
                العنوان
              </label>
              <Input
                id="contact-address"
                value={companyInfo.contact?.address || ""}
                onChange={(e) => setCompanyInfo({
                  ...companyInfo, 
                  contact: { 
                    ...companyInfo.contact,
                    address: e.target.value
                  }
                })}
              />
            </div>
            
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <Input
                id="contact-email"
                value={companyInfo.contact?.email || ""}
                onChange={(e) => setCompanyInfo({
                  ...companyInfo, 
                  contact: { 
                    ...companyInfo.contact,
                    email: e.target.value
                  }
                })}
              />
            </div>
            
            <div>
              <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <Input
                id="contact-phone"
                value={companyInfo.contact?.phone || ""}
                onChange={(e) => setCompanyInfo({
                  ...companyInfo, 
                  contact: { 
                    ...companyInfo.contact,
                    phone: e.target.value
                  }
                })}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
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
    </div>
  );
};

export default AdminAbout;
