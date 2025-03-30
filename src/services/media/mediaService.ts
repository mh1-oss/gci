
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Media Upload
export const uploadMedia = async (file: File): Promise<string | null> => {
  try {
    // Generate a unique file path
    const fileExt = file.name.split('.').pop();
    const filePath = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
    
    // First create a storage bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('media');
    
    if (bucketError && bucketError.message.includes('does not exist')) {
      // Bucket doesn't exist, create it
      const { error: createBucketError } = await supabase.storage.createBucket('media', {
        public: true
      });
      
      if (createBucketError) {
        console.error('Error creating storage bucket:', createBucketError);
        toast({
          title: "خطأ في تهيئة مخزن الوسائط",
          description: createBucketError.message,
          variant: "destructive",
        });
        return null;
      }
    }
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast({
        title: "خطأ في رفع الملف",
        description: uploadError.message,
        variant: "destructive",
      });
      return null;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    toast({
      title: "تم بنجاح",
      description: "تم رفع الملف بنجاح",
    });
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Unexpected error uploading file:', error);
    toast({
      title: "خطأ غير متوقع",
      description: "حدث خطأ أثناء رفع الملف",
      variant: "destructive",
    });
    return null;
  }
};
