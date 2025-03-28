
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

const VisualizerPage = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    document.title = "مودرن بينت - محاكي الألوان";
    
    // Show a toast notification
    toast({
      title: "جاري التحويل",
      description: "سيتم تحويلك إلى محاكي الألوان الخارجي",
      duration: 2000,
    });
    
    // Redirect to the GCI Paint visualizer after a short delay
    const redirectTimer = setTimeout(() => {
      window.location.href = "https://gcipaint.com/ar/pages/other/visualizer";
    }, 2000);
    
    return () => clearTimeout(redirectTimer);
  }, [toast]);
  
  return (
    <div className="py-10" dir="rtl">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">محاكي الألوان</h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            جاري تحويلك إلى محاكي الألوان الاحترافي...
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizerPage;
