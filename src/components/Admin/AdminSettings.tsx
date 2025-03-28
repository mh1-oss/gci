
import { useState, useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { getCompanyInfo, updateCompanyInfo } from "@/services/dataService";
import { CompanyInfo } from "@/data/initialData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const AdminSettings = () => {
  const { exchangeRate, setExchangeRate } = useCurrency();
  const [tempExchangeRate, setTempExchangeRate] = useState(exchangeRate.toString());
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
          title: "Error",
          description: "Could not load company information.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Update temp exchange rate when context value changes
  useEffect(() => {
    setTempExchangeRate(exchangeRate.toString());
  }, [exchangeRate]);

  const handleExchangeRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRate = parseFloat(tempExchangeRate);
    
    if (isNaN(newRate) || newRate <= 0) {
      toast({
        title: "Invalid Rate",
        description: "Please enter a valid positive number for the exchange rate.",
        variant: "destructive",
      });
      return;
    }
    
    setExchangeRate(newRate);
    toast({
      title: "Exchange Rate Updated",
      description: `The exchange rate has been set to 1 USD = ${newRate} IQD.`,
      variant: "default",
    });
  };

  const handleCompanyInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInfo) return;
    
    try {
      setSaving(true);
      await updateCompanyInfo(companyInfo);
      toast({
        title: "Company Info Updated",
        description: "Company information has been successfully updated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating company info:", error);
      toast({
        title: "Error",
        description: "Could not update company information.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCompanyField = (
    field: string, 
    value: string, 
    isNested: boolean = false, 
    nestedField?: string, 
    deepNested?: boolean,
    deepNestedField?: string
  ) => {
    if (!companyInfo) return;
    
    if (!isNested) {
      setCompanyInfo({
        ...companyInfo,
        [field]: value,
      });
    } else if (isNested && nestedField && !deepNested) {
      setCompanyInfo({
        ...companyInfo,
        [field]: {
          ...companyInfo[field as keyof CompanyInfo],
          [nestedField]: value,
        },
      });
    } else if (isNested && nestedField && deepNested && deepNestedField) {
      setCompanyInfo({
        ...companyInfo,
        [field]: {
          ...companyInfo[field as keyof CompanyInfo],
          [nestedField]: {
            ...(companyInfo[field as keyof CompanyInfo] as any)[nestedField],
            [deepNestedField]: value,
          },
        },
      });
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
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <Tabs defaultValue="currency" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="currency">Currency Settings</TabsTrigger>
          <TabsTrigger value="company">Company Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="currency">
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Update the exchange rate between USD and IQD. This affects how prices are displayed throughout the website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExchangeRateSubmit} id="exchange-rate-form">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="exchange-rate" className="block text-sm font-medium text-gray-700 mb-1">
                      Exchange Rate (1 USD to IQD)
                    </label>
                    <div className="flex">
                      <Input
                        id="exchange-rate"
                        type="number"
                        step="0.01"
                        min="0"
                        value={tempExchangeRate}
                        onChange={(e) => setTempExchangeRate(e.target.value)}
                        className="rounded-r-none"
                      />
                      <div className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 flex items-center rounded-r-md">
                        IQD
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Current rate: 1 USD = {exchangeRate} IQD
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button type="submit" form="exchange-rate-form">
                Update Exchange Rate
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="company">
          {companyInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Update your company details that appear throughout the website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompanyInfoSubmit} id="company-info-form">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Basic Information</h3>
                      
                      <div>
                        <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name
                        </label>
                        <Input
                          id="company-name"
                          value={companyInfo.name}
                          onChange={(e) => updateCompanyField("name", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company-slogan" className="block text-sm font-medium text-gray-700 mb-1">
                          Slogan
                        </label>
                        <Input
                          id="company-slogan"
                          value={companyInfo.slogan}
                          onChange={(e) => updateCompanyField("slogan", e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company-about" className="block text-sm font-medium text-gray-700 mb-1">
                          About
                        </label>
                        <Textarea
                          id="company-about"
                          value={companyInfo.about}
                          onChange={(e) => updateCompanyField("about", e.target.value)}
                          rows={5}
                        />
                      </div>
                    </div>
                    
                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Contact Information</h3>
                      
                      <div>
                        <label htmlFor="company-address" className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <Input
                          id="company-address"
                          value={companyInfo.contact.address}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "address")}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company-email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <Input
                          id="company-email"
                          type="email"
                          value={companyInfo.contact.email}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "email")}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <Input
                          id="company-phone"
                          value={companyInfo.contact.phone}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "phone")}
                        />
                      </div>
                    </div>
                    
                    {/* Social Media */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Social Media</h3>
                      
                      <div>
                        <label htmlFor="social-facebook" className="block text-sm font-medium text-gray-700 mb-1">
                          Facebook URL
                        </label>
                        <Input
                          id="social-facebook"
                          value={companyInfo.contact.socialMedia.facebook}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "socialMedia", true, "facebook")}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="social-instagram" className="block text-sm font-medium text-gray-700 mb-1">
                          Instagram URL
                        </label>
                        <Input
                          id="social-instagram"
                          value={companyInfo.contact.socialMedia.instagram}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "socialMedia", true, "instagram")}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="social-twitter" className="block text-sm font-medium text-gray-700 mb-1">
                          Twitter URL
                        </label>
                        <Input
                          id="social-twitter"
                          value={companyInfo.contact.socialMedia.twitter}
                          onChange={(e) => updateCompanyField("contact", e.target.value, true, "socialMedia", true, "twitter")}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button type="submit" form="company-info-form" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
