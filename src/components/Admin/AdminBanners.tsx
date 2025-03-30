import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Banner } from "@/data/initialData";
import { 
  ArrowUpDown, 
  Plus, 
  Trash, 
  Image, 
  Film, 
  RefreshCw,
  PaintBucket
} from "lucide-react";

const AdminBanners = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({
    title: "",
    subtitle: "",
    image: "",
    mediaType: "image",
    ctaText: "اكتشف المزيد",
    ctaLink: "/products",
    sliderHeight: 70,
    textColor: "#ffffff"
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  useEffect(() => {
    fetchBanners();
  }, []);
  
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order_index', { ascending: true });
        
      if (error) throw error;
      
      const formattedBanners: Banner[] = (data || []).map((banner: any) => ({
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle,
        image: banner.image || '',
        videoUrl: banner.video_url,
        mediaType: banner.media_type as "image" | "video",
        ctaText: banner.cta_text || 'اكتشف المزيد',
        ctaLink: banner.cta_link || '/products',
        order: banner.order_index,
        sliderHeight: banner.slider_height,
        textColor: banner.text_color
      }));
      
      setBanners(formattedBanners);
    } catch (error: any) {
      console.error('Error fetching banners:', error);
      toast({
        title: "خطأ في جلب البانرات",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddBanner = async () => {
    try {
      // Validate required fields
      if (!newBanner.title || !newBanner.subtitle) {
        toast({
          title: "حقول مطلوبة",
          description: "يرجى ملء جميع الحقول المطلوبة",
          variant: "destructive",
        });
        return;
      }
      
      let imageUrl = newBanner.image;
      let videoUrl = newBanner.videoUrl;
      
      // Upload image if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, imageFile);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);
          
        imageUrl = urlData.publicUrl;
      }
      
      // Upload video if selected
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `video-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, videoFile);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);
          
        videoUrl = urlData.publicUrl;
      }
      
      // Calculate order position
      const maxOrder = banners.length > 0 
        ? Math.max(...banners.map(b => b.order ?? 0)) 
        : 0;
      
      const bannerToInsert = {
        title: newBanner.title,
        subtitle: newBanner.subtitle,
        image: imageUrl,
        video_url: videoUrl,
        media_type: newBanner.mediaType,
        cta_text: newBanner.ctaText,
        cta_link: newBanner.ctaLink,
        order_index: maxOrder + 1,
        slider_height: newBanner.sliderHeight,
        text_color: newBanner.textColor,
        id: `banner-${Date.now()}`
      };
      
      const { data, error } = await supabase
        .from('banners')
        .insert([bannerToInsert]);
        
      if (error) throw error;
      
      toast({
        title: "تم إضافة البانر بنجاح",
        description: `تمت إضافة البانر "${newBanner.title}" بنجاح`,
      });
      
      // Reset form and refresh
      setNewBanner({
        title: "",
        subtitle: "",
        image: "",
        mediaType: "image",
        ctaText: "اكتشف المزيد",
        ctaLink: "/products",
        sliderHeight: 70,
        textColor: "#ffffff"
      });
      setImageFile(null);
      setVideoFile(null);
      fetchBanners();
    } catch (error: any) {
      console.error('Error adding banner:', error);
      toast({
        title: "خطأ في إضافة البانر",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateBanner = async () => {
    if (!editingBanner) return;
    
    try {
      // Upload new image if selected
      let imageUrl = editingBanner.image;
      let videoUrl = editingBanner.videoUrl;
      
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, imageFile);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);
          
        imageUrl = urlData.publicUrl;
      }
      
      if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `video-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners')
          .upload(fileName, videoFile);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);
          
        videoUrl = urlData.publicUrl;
      }
      
      const { data, error } = await supabase
        .from('banners')
        .update({ 
          title: editingBanner.title,
          subtitle: editingBanner.subtitle,
          image: imageUrl,
          video_url: videoUrl,
          media_type: editingBanner.mediaType,
          cta_text: editingBanner.ctaText,
          cta_link: editingBanner.ctaLink,
          slider_height: editingBanner.sliderHeight,
          text_color: editingBanner.textColor
        })
        .eq('id', editingBanner.id);
        
      if (error) throw error;
      
      toast({
        title: "تم تحديث البانر بنجاح",
        description: `تم تحديث البانر "${editingBanner.title}" بنجاح`,
      });
      
      setEditingBanner(null);
      setImageFile(null);
      setVideoFile(null);
      fetchBanners();
    } catch (error: any) {
      console.error('Error updating banner:', error);
      toast({
        title: "خطأ في تحديث البانر",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "تم حذف البانر بنجاح",
        description: "تم حذف البانر من قاعدة البيانات",
      });
      
      fetchBanners();
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      toast({
        title: "خطأ في حذف البانر",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    try {
      const newBanners = [...banners];
      const currentBanner = newBanners[index];
      const previousBanner = newBanners[index - 1];
      
      // Swap order values
      const tempOrder = currentBanner.order;
      
      // Update in database - first banner
      await supabase
        .from('banners')
        .update({ order_index: previousBanner.order })
        .eq('id', currentBanner.id);
      
      // Update in database - second banner  
      await supabase
        .from('banners')
        .update({ order_index: tempOrder })
        .eq('id', previousBanner.id);
      
      fetchBanners();
    } catch (error: any) {
      console.error('Error reordering banners:', error);
      toast({
        title: "خطأ في إعادة ترتيب البانر",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleMoveDown = async (index: number) => {
    if (index === banners.length - 1) return;
    
    try {
      const newBanners = [...banners];
      const currentBanner = newBanners[index];
      const nextBanner = newBanners[index + 1];
      
      // Swap order values
      const tempOrder = currentBanner.order;
      
      // Update in database - first banner
      await supabase
        .from('banners')
        .update({ order_index: nextBanner.order })
        .eq('id', currentBanner.id);
      
      // Update in database - second banner  
      await supabase
        .from('banners')
        .update({ order_index: tempOrder })
        .eq('id', nextBanner.id);
      
      fetchBanners();
    } catch (error: any) {
      console.error('Error reordering banners:', error);
      toast({
        title: "خطأ في إعادة ترتيب البانر",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">إدارة البانرات</h3>
        <Button variant="outline" onClick={fetchBanners} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>
      
      {/* Add New Banner Form */}
      <Card>
        <CardHeader>
          <CardTitle>إضافة بانر جديد</CardTitle>
          <CardDescription>أضف صور وعناوين جديدة لعرضها في الصفحة الرئيسية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-title">العنوان الرئيسي</Label>
                <Input 
                  id="new-title"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                  placeholder="أدخل العنوان الرئيسي"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-subtitle">العنوان الفرعي</Label>
                <Textarea 
                  id="new-subtitle"
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({...newBanner, subtitle: e.target.value})}
                  placeholder="أدخل العنوان الفرعي"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-cta-text">نص زر الدعوة للعمل</Label>
                <Input 
                  id="new-cta-text"
                  value={newBanner.ctaText}
                  onChange={(e) => setNewBanner({...newBanner, ctaText: e.target.value})}
                  placeholder="اكتشف المزيد"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-cta-link">رابط زر الدعوة للعمل</Label>
                <Input 
                  id="new-cta-link"
                  value={newBanner.ctaLink}
                  onChange={(e) => setNewBanner({...newBanner, ctaLink: e.target.value})}
                  placeholder="/products"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-media-type">نوع الوسائط</Label>
                <Select 
                  value={newBanner.mediaType} 
                  onValueChange={(value: "image" | "video") => setNewBanner({...newBanner, mediaType: value})}
                >
                  <SelectTrigger id="new-media-type">
                    <SelectValue placeholder="اختر نوع الوسائط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">صورة</SelectItem>
                    <SelectItem value="video">فيديو</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newBanner.mediaType === 'image' ? (
                <div className="space-y-2">
                  <Label htmlFor="new-image">الصورة</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="new-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Image className="h-5 w-5" />
                  </div>
                  {newBanner.image && (
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <img src={newBanner.image} alt="Preview" className="max-h-32 object-cover" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="new-video">ملف الفيديو</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="new-video"
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setVideoFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Film className="h-5 w-5" />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>ارتفاع السلايدر (%) {newBanner.sliderHeight}%</Label>
                <Slider 
                  value={[newBanner.sliderHeight || 70]}
                  min={50}
                  max={100}
                  step={5}
                  onValueChange={(value) => setNewBanner({...newBanner, sliderHeight: value[0]})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-text-color">لون النص</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="new-text-color"
                    type="color"
                    value={newBanner.textColor}
                    onChange={(e) => setNewBanner({...newBanner, textColor: e.target.value})}
                    className="w-12 h-10 p-1"
                  />
                  <PaintBucket className="h-5 w-5" />
                  <span>{newBanner.textColor}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddBanner} className="w-full">
            <Plus className="h-4 w-4 ml-2" />
            إضافة بانر جديد
          </Button>
        </CardFooter>
      </Card>
      
      {/* Existing Banners */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">البانرات الحالية</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-brand-blue" />
            <p className="mt-2 text-gray-500">جاري تحميل البانرات...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/50">
            <p className="text-gray-500">لا توجد بانرات حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((banner, index) => (
              <Card key={banner.id} className={editingBanner?.id === banner.id ? 'ring-2 ring-brand-blue' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{banner.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleMoveUp(index)} 
                        disabled={index === 0}
                      >
                        <ArrowUpDown className="h-4 w-4 rotate-90" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleMoveDown(index)} 
                        disabled={index === banners.length - 1}
                      >
                        <ArrowUpDown className="h-4 w-4 -rotate-90" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{banner.subtitle}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  {editingBanner?.id === banner.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-title-${banner.id}`}>العنوان الرئيسي</Label>
                          <Input 
                            id={`edit-title-${banner.id}`}
                            value={editingBanner.title}
                            onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`edit-subtitle-${banner.id}`}>العنوان الفرعي</Label>
                          <Textarea 
                            id={`edit-subtitle-${banner.id}`}
                            value={editingBanner.subtitle}
                            onChange={(e) => setEditingBanner({...editingBanner, subtitle: e.target.value})}
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`edit-cta-text-${banner.id}`}>نص زر الدعوة للعمل</Label>
                          <Input 
                            id={`edit-cta-text-${banner.id}`}
                            value={editingBanner.ctaText}
                            onChange={(e) => setEditingBanner({...editingBanner, ctaText: e.target.value})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`edit-cta-link-${banner.id}`}>رابط زر الدعوة للعمل</Label>
                          <Input 
                            id={`edit-cta-link-${banner.id}`}
                            value={editingBanner.ctaLink}
                            onChange={(e) => setEditingBanner({...editingBanner, ctaLink: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-media-type-${banner.id}`}>نوع الوسائط</Label>
                          <Select 
                            value={editingBanner.mediaType} 
                            onValueChange={(value) => setEditingBanner({...editingBanner, mediaType: value})}
                          >
                            <SelectTrigger id={`edit-media-type-${banner.id}`}>
                              <SelectValue placeholder="اختر نوع الوسائط" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="image">صورة</SelectItem>
                              <SelectItem value="video">فيديو</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {editingBanner.mediaType === 'image' ? (
                          <div className="space-y-2">
                            <Label htmlFor={`edit-image-${banner.id}`}>الصورة</Label>
                            <div className="flex items-center gap-2">
                              <Input 
                                id={`edit-image-${banner.id}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setImageFile(e.target.files[0]);
                                  }
                                }}
                              />
                              <Image className="h-5 w-5" />
                            </div>
                            {editingBanner.image && (
                              <div className="mt-2 border rounded-md overflow-hidden">
                                <img src={editingBanner.image} alt="Preview" className="max-h-32 object-cover" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor={`edit-video-${banner.id}`}>ملف الفيديو</Label>
                            <div className="flex items-center gap-2">
                              <Input 
                                id={`edit-video-${banner.id}`}
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setVideoFile(e.target.files[0]);
                                  }
                                }}
                              />
                              <Film className="h-5 w-5" />
                            </div>
                            {editingBanner.videoUrl && (
                              <div className="mt-2 border rounded-md overflow-hidden">
                                <p className="text-sm text-gray-500 p-2">فيديو الحالي: {editingBanner.videoUrl}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label>ارتفاع السلايدر (%) {editingBanner.sliderHeight}%</Label>
                          <Slider 
                            value={[editingBanner.sliderHeight || 70]}
                            min={50}
                            max={100}
                            step={5}
                            onValueChange={(value) => setEditingBanner({...editingBanner, sliderHeight: value[0]})}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`edit-text-color-${banner.id}`}>لون النص</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              id={`edit-text-color-${banner.id}`}
                              type="color"
                              value={editingBanner.textColor}
                              onChange={(e) => setEditingBanner({...editingBanner, textColor: e.target.value})}
                              className="w-12 h-10 p-1"
                            />
                            <PaintBucket className="h-5 w-5" />
                            <span>{editingBanner.textColor}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>العنوان الفرعي:</strong> {banner.subtitle}</p>
                        <p><strong>نص ال��ر:</strong> {banner.ctaText}</p>
                        <p><strong>رابط الزر:</strong> {banner.ctaLink}</p>
                        <p><strong>ارتفاع السلايدر:</strong> {banner.sliderHeight}%</p>
                        <p><strong>لون النص:</strong> <span className="inline-block w-4 h-4 align-middle" style={{backgroundColor: banner.textColor}}></span> {banner.textColor}</p>
                      </div>
                      
                      <div className="space-y-2">
                        {banner.mediaType === 'image' ? (
                          <div className="border rounded-md overflow-hidden">
                            <img src={banner.image} alt={banner.title} className="max-h-36 object-cover mx-auto" />
                          </div>
                        ) : (
                          <div className="border rounded-md p-2">
                            <p className="flex items-center gap-2">
                              <Film className="h-5 w-5" />
                              <span>فيديو: {banner.videoUrl}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between pt-0">
                  {editingBanner?.id === banner.id ? (
                    <>
                      <Button 
                        variant="secondary" 
                        onClick={() => setEditingBanner(null)}
                      >
                        إلغاء
                      </Button>
                      <Button onClick={handleUpdateBanner}>
                        حفظ التغييرات
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDeleteBanner(banner.id)}
                      >
                        <Trash className="h-4 w-4 ml-2" />
                        حذف
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingBanner(banner)}
                      >
                        تعديل
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBanners;
