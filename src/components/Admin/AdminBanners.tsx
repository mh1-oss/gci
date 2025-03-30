
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Move, ArrowUpCircle, ArrowDownCircle, Trash, Edit, Plus, ImageIcon, Film } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Banner } from '@/data/initialData';

const AdminBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    ctaText: 'اكتشف المزيد',
    ctaLink: '/products',
    mediaType: 'image',
    image: '',
    videoUrl: '',
    sliderHeight: 70,
    textColor: '#ffffff'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

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
      
      if (data && data.length > 0) {
        const mappedBanners: Banner[] = data.map(banner => ({
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle || '',
          image: banner.image || '',
          videoUrl: banner.video_url || '',
          mediaType: (banner.media_type as "image" | "video") || "image",
          ctaText: banner.cta_text || 'اكتشف المزيد',
          ctaLink: banner.cta_link || '/products',
          orderIndex: banner.order_index || 0,
          sliderHeight: banner.slider_height || 70,
          textColor: banner.text_color || '#ffffff'
        }));
        
        setBanners(mappedBanners);
      } else {
        setBanners([]);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast({
        title: 'خطأ في جلب الشرائح',
        description: 'حدث خطأ أثناء جلب شرائح العرض',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, imageFile);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading banner image:', error);
      toast({
        title: 'خطأ في رفع الصورة',
        description: 'حدث خطأ أثناء رفع صورة الشريحة',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Upload image if provided
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      // Prepare banner data - now with the correct structure for Supabase
      const newBanner = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        image: formData.mediaType === 'image' ? imageUrl : null,
        video_url: formData.mediaType === 'video' ? formData.videoUrl : null,
        media_type: formData.mediaType,
        cta_text: formData.ctaText,
        cta_link: formData.ctaLink,
        order_index: banners.length, // Add to the end
        slider_height: formData.sliderHeight,
        text_color: formData.textColor
      };
      
      // Insert into database
      const { error } = await supabase
        .from('banners')
        .insert(newBanner);
      
      if (error) throw error;
      
      toast({
        title: 'تمت الإضافة بنجاح',
        description: 'تم إضافة شريحة العرض بنجاح',
      });
      
      // Refresh banners
      fetchBanners();
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error adding banner:', error);
      toast({
        title: 'خطأ في إضافة الشريحة',
        description: 'حدث خطأ أثناء إضافة شريحة العرض',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentBanner) return;
    
    setIsSubmitting(true);
    
    try {
      // Upload image if provided
      let imageUrl = formData.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      // Prepare update data
      const updateData = {
        title: formData.title,
        subtitle: formData.subtitle || null,
        image: formData.mediaType === 'image' ? imageUrl : null,
        video_url: formData.mediaType === 'video' ? formData.videoUrl : null,
        media_type: formData.mediaType,
        cta_text: formData.ctaText,
        cta_link: formData.ctaLink,
        slider_height: formData.sliderHeight,
        text_color: formData.textColor
      };
      
      // Update in database
      const { error } = await supabase
        .from('banners')
        .update(updateData)
        .eq('id', currentBanner.id);
      
      if (error) throw error;
      
      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم تحديث شريحة العرض بنجاح',
      });
      
      // Refresh banners
      fetchBanners();
      setShowEditDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: 'خطأ في تحديث الشريحة',
        description: 'حدث خطأ أثناء تحديث شريحة العرض',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteBanner = async () => {
    if (!currentBanner) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', currentBanner.id);
      
      if (error) throw error;
      
      toast({
        title: 'تم الحذف بنجاح',
        description: 'تم حذف شريحة العرض بنجاح',
      });
      
      // Refresh banners
      fetchBanners();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: 'خطأ في حذف الشريحة',
        description: 'حدث خطأ أثناء حذف شريحة العرض',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleMoveBanner = async (banner: Banner, direction: 'up' | 'down') => {
    const bannerIndex = banners.findIndex(b => b.id === banner.id);
    if (
      (direction === 'up' && bannerIndex === 0) || 
      (direction === 'down' && bannerIndex === banners.length - 1)
    ) {
      return;
    }
    
    const targetIndex = direction === 'up' ? bannerIndex - 1 : bannerIndex + 1;
    const targetBanner = banners[targetIndex];
    
    // Swap order indexes
    const updatedBanners = [...banners];
    const tempOrder = updatedBanners[bannerIndex].orderIndex;
    updatedBanners[bannerIndex].orderIndex = updatedBanners[targetIndex].orderIndex;
    updatedBanners[targetIndex].orderIndex = tempOrder;
    
    // Update database
    try {
      await supabase
        .from('banners')
        .update({ order_index: updatedBanners[bannerIndex].orderIndex })
        .eq('id', banner.id);
      
      await supabase
        .from('banners')
        .update({ order_index: updatedBanners[targetIndex].orderIndex })
        .eq('id', targetBanner.id);
      
      // Update local state
      setBanners([...updatedBanners].sort((a, b) => a.orderIndex - b.orderIndex));
      
      toast({
        title: 'تم تحديث الترتيب',
        description: 'تم تحديث ترتيب الشرائح بنجاح',
      });
    } catch (error) {
      console.error('Error updating banner order:', error);
      toast({
        title: 'خطأ في تحديث الترتيب',
        description: 'حدث خطأ أثناء تحديث ترتيب الشرائح',
        variant: 'destructive',
      });
    }
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      ctaText: 'اكتشف المزيد',
      ctaLink: '/products',
      mediaType: 'image',
      image: '',
      videoUrl: '',
      sliderHeight: 70,
      textColor: '#ffffff'
    });
    setImageFile(null);
    setCurrentBanner(null);
  };
  
  const openEditDialog = (banner: Banner) => {
    setCurrentBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      ctaText: banner.ctaText || 'اكتشف المزيد',
      ctaLink: banner.ctaLink || '/products',
      mediaType: banner.mediaType || 'image',
      image: banner.image || '',
      videoUrl: banner.videoUrl || '',
      sliderHeight: banner.sliderHeight || 70,
      textColor: banner.textColor || '#ffffff'
    });
    setShowEditDialog(true);
  };
  
  const openDeleteDialog = (banner: Banner) => {
    setCurrentBanner(banner);
    setShowDeleteDialog(true);
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>إدارة شرائح العرض</CardTitle>
            <CardDescription>إضافة وتعديل شرائح العرض الظاهرة في الصفحة الرئيسية</CardDescription>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة شريحة جديدة
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد شرائح عرض. أضف شريحة جديدة للبدء.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>العنوان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead className="w-20">الارتفاع</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner, index) => (
                  <TableRow key={banner.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{banner.title}</div>
                        <div className="text-sm text-muted-foreground">{banner.subtitle}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {banner.mediaType === 'image' ? (
                        <div className="flex items-center">
                          <ImageIcon className="h-4 w-4 ml-2" />
                          صورة
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Film className="h-4 w-4 ml-2" />
                          فيديو
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{banner.sliderHeight || 70}%</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={index === 0}
                          onClick={() => handleMoveBanner(banner, 'up')}
                        >
                          <ArrowUpCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          disabled={index === banners.length - 1}
                          onClick={() => handleMoveBanner(banner, 'down')}
                        >
                          <ArrowDownCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDeleteDialog(banner)}
                          className="text-red-500"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Banner Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>إضافة شريحة عرض جديدة</DialogTitle>
            <DialogDescription>
              أضف شريحة عرض جديدة للظهور في الصفحة الرئيسية
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBanner}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">العنوان</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">العنوان الفرعي</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="media-type">نوع الوسائط</Label>
                <Select 
                  defaultValue={formData.mediaType} 
                  onValueChange={(value) => setFormData({...formData, mediaType: value as "image" | "video"})}
                >
                  <SelectTrigger id="media-type">
                    <SelectValue placeholder="اختر نوع الوسائط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">صورة</SelectItem>
                    <SelectItem value="video">فيديو</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.mediaType === 'image' ? (
                <div>
                  <Label htmlFor="image">الصورة</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="max-h-32 rounded-md" 
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Label htmlFor="video-url">رابط الفيديو</Label>
                  <Input
                    id="video-url"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    placeholder="https://example.com/video.mp4"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    أدخل رابط مباشر لملف فيديو (MP4، WebM)
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta-text">نص زر الدعوة للعمل</Label>
                  <Input
                    id="cta-text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="cta-link">رابط زر الدعوة للعمل</Label>
                  <Input
                    id="cta-link"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({...formData, ctaLink: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slider-height">ارتفاع الشريحة (%)</Label>
                  <Input
                    id="slider-height"
                    type="number"
                    min="30"
                    max="100"
                    value={formData.sliderHeight}
                    onChange={(e) => setFormData({...formData, sliderHeight: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="text-color">لون النص</Label>
                  <div className="flex">
                    <Input
                      id="text-color"
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({...formData, textColor: e.target.value})}
                      className="w-12 p-1 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => setFormData({...formData, textColor: e.target.value})}
                      className="flex-1 mr-2"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الإضافة...
                  </>
                ) : 'إضافة الشريحة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>تعديل شريحة العرض</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات شريحة العرض
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditBanner}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">العنوان</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-subtitle">العنوان الفرعي</Label>
                  <Input
                    id="edit-subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-media-type">نوع الوسائط</Label>
                <Select 
                  value={formData.mediaType}
                  onValueChange={(value) => setFormData({...formData, mediaType: value as "image" | "video"})}
                >
                  <SelectTrigger id="edit-media-type">
                    <SelectValue placeholder="اختر نوع الوسائط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">صورة</SelectItem>
                    <SelectItem value="video">فيديو</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.mediaType === 'image' ? (
                <div>
                  <Label htmlFor="edit-image">الصورة</Label>
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={formData.image} 
                        alt="Preview" 
                        className="max-h-32 rounded-md" 
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Label htmlFor="edit-video-url">رابط الفيديو</Label>
                  <Input
                    id="edit-video-url"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                    placeholder="https://example.com/video.mp4"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    أدخل رابط مباشر لملف فيديو (MP4، WebM)
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-cta-text">نص زر الدعوة للعمل</Label>
                  <Input
                    id="edit-cta-text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cta-link">رابط زر الدعوة للعمل</Label>
                  <Input
                    id="edit-cta-link"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData({...formData, ctaLink: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-slider-height">ارتفاع الشريحة (%)</Label>
                  <Input
                    id="edit-slider-height"
                    type="number"
                    min="30"
                    max="100"
                    value={formData.sliderHeight}
                    onChange={(e) => setFormData({...formData, sliderHeight: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-text-color">لون النص</Label>
                  <div className="flex">
                    <Input
                      id="edit-text-color"
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({...formData, textColor: e.target.value})}
                      className="w-12 p-1 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.textColor}
                      onChange={(e) => setFormData({...formData, textColor: e.target.value})}
                      className="flex-1 mr-2"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowEditDialog(false);
                  resetForm();
                }}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : 'تحديث الشريحة'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Banner Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الشريحة؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء بعد التنفيذ.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setCurrentBanner(null);
            }}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteBanner}
              className="bg-red-500 hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBanners;
