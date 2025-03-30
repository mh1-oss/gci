
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { getCompanyInfo, updateCompanyInfo } from "@/services/dataService";
import { CompanyInfo } from "@/data/initialData";

const AdminAbout = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const info = await getCompanyInfo();
        setCompanyInfo(info);
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

  const handleSave = async () => {
    if (!companyInfo) return;
    
    try {
      setSaving(true);
      await updateCompanyInfo(companyInfo);
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث معلومات الشركة.",
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
