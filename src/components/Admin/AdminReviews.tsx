
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash, Edit, Plus } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface Review {
  id: string;
  name: string;
  location: string;
  content: string;
  rating: number;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      name: "أحمد س.",
      location: "بغداد",
      content: "طلاء الداخلي الذي اشتريته حول غرفة معيشتي. اللون مطابق تمامًا لما هو معروض، والطلاء تم بسلاسة مع تغطية رائعة.",
      rating: 5
    },
    {
      id: "2",
      name: "زينب م.",
      location: "البصرة",
      content: "طلاء الخارجي تحمل الظروف الجوية القاسية لأكثر من عام حتى الآن، وما زال يبدو طازجًا. أوصي به بشدة!",
      rating: 5
    },
    {
      id: "3",
      name: "كريم ج.",
      location: "أربيل",
      content: "استخدمت صبغة الخشب لأثاثي وأنا راضٍ للغاية عن النتيجة. تعزيز اللون جميل وكان التطبيق سهلاً.",
      rating: 5
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();

  const handleEdit = (review: Review) => {
    setCurrentReview(review);
    setIsEditOpen(true);
  };

  const handleAdd = () => {
    setCurrentReview({
      id: Date.now().toString(),
      name: "",
      location: "",
      content: "",
      rating: 5
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: string) => {
    setReviews(reviews.filter(review => review.id !== id));
    toast({
      title: "تم الحذف",
      description: "تم حذف المراجعة بنجاح",
    });
  };

  const handleSave = () => {
    if (!currentReview) return;
    
    const isNew = !reviews.find(r => r.id === currentReview.id);
    
    if (isNew) {
      setReviews([...reviews, currentReview]);
    } else {
      setReviews(reviews.map(r => r.id === currentReview.id ? currentReview : r));
    }
    
    setIsEditOpen(false);
    toast({
      title: isNew ? "تمت الإضافة" : "تم التحديث",
      description: isNew ? "تمت إضافة المراجعة بنجاح" : "تم تحديث المراجعة بنجاح",
    });
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
                  <TableHead>الموقع</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead>المحتوى</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.name}</TableCell>
                    <TableCell>{review.location}</TableCell>
                    <TableCell>{review.rating} نجوم</TableCell>
                    <TableCell className="max-w-xs truncate">{review.content}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(review)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(review.id)}>
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
      
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentReview && reviews.find(r => r.id === currentReview.id) 
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
                  value={currentReview.name} 
                  onChange={(e) => setCurrentReview({...currentReview, name: e.target.value})}
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">الموقع</label>
                <Input 
                  id="location" 
                  value={currentReview.location} 
                  onChange={(e) => setCurrentReview({...currentReview, location: e.target.value})}
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
