
import { useState, useEffect } from "react";
import { getBanners, updateBanner } from "@/services/dataService";
import { Banner } from "@/data/initialData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";

const AdminContent = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
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
          title: "Error",
          description: "Could not load banners.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBanners();
  }, [toast]);

  const handleBannerChange = (index: number, field: keyof Banner, value: string) => {
    const updatedBanners = [...banners];
    updatedBanners[index] = {
      ...updatedBanners[index],
      [field]: value
    };
    setBanners(updatedBanners);
  };

  const handleBannerSave = async (banner: Banner) => {
    try {
      setSaving(banner.id);
      const updatedBanner = await updateBanner(banner.id, banner);
      
      if (updatedBanner) {
        toast({
          title: "Banner Updated",
          description: "The banner has been updated successfully.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to update banner");
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      toast({
        title: "Error",
        description: "Could not update the banner.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
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
    <div>
      <h2 className="text-2xl font-bold mb-6">Content Management</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Banner Sliders</h3>
        <p className="text-gray-500 mb-6">
          Customize the hero banner sliders that appear on the homepage.
        </p>
        
        <div className="space-y-6">
          {banners.map((banner, index) => (
            <Card key={banner.id}>
              <CardHeader>
                <CardTitle className="text-lg">Banner {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor={`title-${banner.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <Input
                    id={`title-${banner.id}`}
                    value={banner.title}
                    onChange={(e) => handleBannerChange(index, "title", e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor={`subtitle-${banner.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <Input
                    id={`subtitle-${banner.id}`}
                    value={banner.subtitle}
                    onChange={(e) => handleBannerChange(index, "subtitle", e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor={`image-${banner.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <Input
                    id={`image-${banner.id}`}
                    value={banner.image}
                    onChange={(e) => handleBannerChange(index, "image", e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`cta-text-${banner.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Button Text
                    </label>
                    <Input
                      id={`cta-text-${banner.id}`}
                      value={banner.ctaText}
                      onChange={(e) => handleBannerChange(index, "ctaText", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`cta-link-${banner.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Button Link
                    </label>
                    <Input
                      id={`cta-link-${banner.id}`}
                      value={banner.ctaLink}
                      onChange={(e) => handleBannerChange(index, "ctaLink", e.target.value)}
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
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
