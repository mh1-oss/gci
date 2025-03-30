
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash, Edit, Plus, Upload, X } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  customer_name: string;
  position: string;
  content: string;
  rating: number;
  image_url?: string;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المراجعات.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: Review) => {
    setCurrentReview(review);
    setImagePreview(review.image_url || null);
    setIsEditOpen(true);
  };

  const handleAdd = () => {
    setCurrentReview({
      id: "",
      customer_name: "",
      position: "",
      content: "",
      rating: 5,
      image_url: ""
    });
    setImagePreview(null);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setReviews(reviews.filter(review => review.id !== id));
      toast({
        title: "تم الحذف",
        description: "تم حذف المراجعة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المراجعة.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentReview) return;

    try {
      // Generate a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
      
      // First create a storage bucket if it doesn't exist
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('reviews');
      
      if (bucketError && bucketError.message.includes('does not exist')) {
        // Bucket doesn't exist, create it
        await supabase.storage.createBucket('reviews', {
          public: true
        });
      }
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('reviews')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('reviews')
        .getPublicUrl(filePath);
      
      setImagePreview(publicUrlData.publicUrl);
      setCurrentReview({
        ...currentReview,
        image_url: publicUrlData.publicUrl
      });
      
      toast({
        title: "تم التحميل",
        description: "تم تحميل الصورة بنجاح",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل الصورة.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!currentReview) return;
    
    try {
      const isNew = !currentReview.id;
      
      if (isNew) {
        // Create new review
        const { data, error } = await supabase
          .from('reviews')
          .insert([{
            customer_name: currentReview.customer_name,
            position: currentReview.position,
            content: currentReview.content,
            rating: currentReview.rating,
            image_url: currentReview.image_url
          }])
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        setReviews([data, ...reviews]);
      } else {
        // Update existing review
        const { data, error } = await supabase
          .from('reviews')
          .update({
            customer_name: currentReview.customer_name,
            position: currentReview.position,
            content: currentReview.content,
            rating: currentReview.rating,
            image_url: currentReview.image_url
          })
          .eq('id', currentReview.id)
          .select()
          .single();
        
        if (error) {
          throw error;
        }
        
        setReviews(reviews.map(r => r.id === data.id ? data : r));
      }
      
      setIsEditOpen(false);
      toast({
        title: isNew ? "تمت الإضافة" : "تم التحديث",
        description: isNew ? "تمت إضافة المراجعة بنجاح" : "تم تحديث المراجعة بنجاح",
      });
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ المراجعة.",
        variant: "destructive",
      });
    }
  };

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">إدارة المراجعات</h2>
        <Button onClick={handleAdd}>
          <Plus className="ml-2 h-4 w-4" /> إضافة مراجعة
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>المراجعات الحالية</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>المنصب</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>المحتوى</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.customer_name}</TableCell>
                    <TableCell>{review.position || "-"}</TableCell>
                    <TableCell>{review.rating} نجوم</TableCell>
                    <TableCell className="max-w-xs truncate">{review.content}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(review)} className="ml-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(review.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {reviews.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6">
                      لا توجد مراجعات. أضف مراجعة جديدة الآن.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {currentReview && currentReview.id 
                ? "تعديل المراجعة" 
                : "إضافة مراجعة جديدة"}
            </DialogTitle>
            <DialogDescription>
              أدخل تفاصيل المراجعة أدناه.
            </DialogDescription>
          </DialogHeader>
          
          {currentReview && (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">الاسم</label>
                <Input 
                  id="name" 
                  value={currentReview.customer_name} 
                  onChange={(e) => setCurrentReview({...currentReview, customer_name: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="position" className="block text-sm font-medium mb-1">المنصب</label>
                <Input 
                  id="position" 
                  value={currentReview.position || ""} 
                  onChange={(e) => setCurrentReview({...currentReview, position: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium mb-1">التقييم (1-5)</label>
                <Input 
                  id="rating" 
                  type="number" 
                  min="1" 
                  max="5" 
                  value={currentReview.rating} 
                  onChange={(e) => setCurrentReview({...currentReview, rating: parseInt(e.target.value)})}
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">المحتوى</label>
                <Textarea 
                  id="content" 
                  value={currentReview.content} 
                  onChange={(e) => setCurrentReview({...currentReview, content: e.target.value})}
                  rows={5}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">صورة (اختياري)</label>
                <div className="flex flex-col space-y-4">
                  {imagePreview && (
                    <div className="relative w-32 h-32 border border-gray-300 rounded-md overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="صورة المراجعة" 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          setImagePreview(null);
                          setCurrentReview({...currentReview, image_url: ""});
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div>
                    <label htmlFor="review-image-upload" className="cursor-pointer">
                      <div className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors">
                        <Upload className="h-4 w-4 ml-2" />
                        <span>تحميل صورة</span>
                      </div>
                      <input 
                        id="review-image-upload" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
