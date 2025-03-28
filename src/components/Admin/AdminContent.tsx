
import { useState, useEffect, useRef } from "react";
import { getBanners, updateBanner } from "@/services/dataService";
import { Banner } from "@/data/initialData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Upload, Image, Video } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const AdminContent = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const data = await getBanners();
        setBanners(data);
      } catch (error) {
        console.error("Error fetching banners:", error);
        toast({
          title: "خطأ",
          description: "لم نتمكن من تحميل البيانات",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBanners();
  }, [toast]);

  const handleBannerChange = (index: number, field: keyof Banner, value: string | undefined) => {
    const updatedBanners = [...banners];
    updatedBanners[index] = {
      ...updatedBanners[index],
      [field]: value
    };
    setBanners(updatedBanners);
  };

  const handleMediaTypeChange = (index: number, mediaType: 'image' | 'video') => {
    const updatedBanners = [...banners];
    updatedBanners[index] = {
      ...updatedBanners[index],
      mediaType: mediaType
    };
    setBanners(updatedBanners);
  };

  const handleFileUpload = (index: number, file: File, type: 'image' | 'video') => {
    setUploading(banners[index].id);
    
    // Simulate file upload - in a real app this would upload to a server
    setTimeout(() => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        const updatedBanners = [...banners];
        
        if (type === 'image') {
          updatedBanners[index].image = url;
        } else if (type === 'video') {
          updatedBanners[index].videoUrl = url;
        }
        
        setBanners(updatedBanners);
        setUploading(null);
        
        toast({
          title: "تم الرفع بنجاح",
          description: `تم رفع ${type === 'image' ? 'الصورة' : 'الفيديو'} بنجاح`,
        });
      };
      
      reader.readAsDataURL(file);
    }, 1000);
  };

  const handleBannerSave = async (banner: Banner) => {
    try {
      setSaving(banner.id);
      const updatedBanner = await updateBanner(banner.id, banner);
      
      if (updatedBanner) {
        toast({
          title: "تم التحديث",
          description: "تم تحديث البانر بنجاح",
          variant: "default",
        });
      } else {
        throw new Error("فشل في تحديث البانر");
      }
    } catch (error) {
      console.error("خطأ في تحديث البانر:", error);
      toast({
        title: "خطأ",
        description: "لم نتمكن من تحديث البانر",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div dir="rtl">
      <h2 className="text-2xl font-bold mb-6">إدارة المحتوى</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">بانر الشرائح الرئيسية</h3>
        <p className="text-gray-500 mb-6">
          تخصيص شرائح البانر الرئيسية التي تظهر في الصفحة الرئيسية
        </p>
        
        <div className="space-y-6">
          {banners.map((banner, index) => (
            <Card key={banner.id}>
              <CardHeader>
                <CardTitle className="text-lg">البانر {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor={`title-${banner.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان
                  </label>
                  <Input
                    id={`title-${banner.id}`}
                    value={banner.title}
                    onChange={(e) => handleBannerChange(index, "title", e.target.value)}
                    dir="rtl"
                  />
                </div>
                
                <div>
                  <label htmlFor={`subtitle-${banner.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان الفرعي
                  </label>
                  <Input
                    id={`subtitle-${banner.id}`}
                    value={banner.subtitle}
                    onChange={(e) => handleBannerChange(index, "subtitle", e.target.value)}
                    dir="rtl"
                  />
                </div>
                
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">نوع الوسائط</p>
                  <RadioGroup 
                    value={banner.mediaType || 'image'} 
                    onValueChange={(value) => handleMediaTypeChange(index, value as 'image' | 'video')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2 ml-4">
                      <RadioGroupItem value="image" id={`image-type-${banner.id}`} />
                      <Label htmlFor={`image-type-${banner.id}`}>صورة</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="video" id={`video-type-${banner.id}`} />
                      <Label htmlFor={`video-type-${banner.id}`}>فيديو</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {(banner.mediaType === 'image' || !banner.mediaType) && (
                  <div>
                    <label htmlFor={`image-${banner.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      رابط الصورة
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id={`image-${banner.id}`}
                        value={banner.image}
                        onChange={(e) => handleBannerChange(index, "image", e.target.value)}
                        dir="ltr"
                        className="ml-2"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading === banner.id}
                      >
                        {uploading === banner.id ? (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Image className="ml-2 h-4 w-4" />
                        )}
                        تحميل صورة
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(index, file, 'image');
                          }
                          e.target.value = '';
                        }}
                      />
                    </div>
                    {banner.image && (
                      <div className="mt-2">
                        <img 
                          src={banner.image} 
                          alt="Banner preview" 
                          className="h-20 object-cover rounded-md border" 
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {banner.mediaType === 'video' && (
                  <div>
                    <label htmlFor={`video-${banner.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      رابط الفيديو
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id={`video-${banner.id}`}
                        value={banner.videoUrl || ''}
                        onChange={(e) => handleBannerChange(index, "videoUrl", e.target.value)}
                        dir="ltr"
                        className="ml-2"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading === banner.id}
                      >
                        {uploading === banner.id ? (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Video className="ml-2 h-4 w-4" />
                        )}
                        تحميل فيديو
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(index, file, 'video');
                          }
                          e.target.value = '';
                        }}
                      />
                    </div>
                    {banner.videoUrl && (
                      <div className="mt-2">
                        <video 
                          src={banner.videoUrl} 
                          controls 
                          className="h-20 object-cover rounded-md border"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`cta-text-${banner.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      نص الزر
                    </label>
                    <Input
                      id={`cta-text-${banner.id}`}
                      value={banner.ctaText}
                      onChange={(e) => handleBannerChange(index, "ctaText", e.target.value)}
                      dir="rtl"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`cta-link-${banner.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      رابط الزر
                    </label>
                    <Input
                      id={`cta-link-${banner.id}`}
                      value={banner.ctaLink}
                      onChange={(e) => handleBannerChange(index, "ctaLink", e.target.value)}
                      dir="ltr"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => handleBannerSave(banner)}
                    disabled={saving === banner.id}
                  >
                    {saving === banner.id ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="ml-2 h-4 w-4" />
                        حفظ التغييرات
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
