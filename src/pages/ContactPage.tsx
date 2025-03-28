
import { useEffect, useState } from "react";
import { getCompanyInfo } from "@/services/dataService";
import { CompanyInfo } from "@/data/initialData";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const ContactPage = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Modern Paint - Contact Us";
    getCompanyInfo().then(setCompanyInfo);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Message sent",
      description: "Thank you for your message. We'll get back to you soon!",
      variant: "default",
    });
    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  if (!companyInfo) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to answer any questions you may have about our products and services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input 
                    id="name" 
                    name="name" 
                    type="text" 
                    required 
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="Your email address"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Input 
                  id="subject" 
                  name="subject" 
                  type="text" 
                  required 
                  placeholder="What is this regarding?"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <Textarea 
                  id="message" 
                  name="message" 
                  rows={5} 
                  required 
                  placeholder="Type your message here..."
                />
              </div>
              
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-brand-blue text-white p-2 rounded-full mr-4">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Our Address</h3>
                    <p className="text-gray-600">{companyInfo.contact.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-brand-blue text-white p-2 rounded-full mr-4">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone Number</h3>
                    <p className="text-gray-600">{companyInfo.contact.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-brand-blue text-white p-2 rounded-full mr-4">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Address</h3>
                    <p className="text-gray-600">{companyInfo.contact.email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold mb-3">Business Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-3">Follow Us</h3>
              <div className="flex space-x-4">
                <a 
                  href={companyInfo.contact.socialMedia.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-gray-700 hover:bg-brand-blue hover:text-white transition-colors p-3 rounded-full"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href={companyInfo.contact.socialMedia.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-gray-700 hover:bg-brand-blue hover:text-white transition-colors p-3 rounded-full"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href={companyInfo.contact.socialMedia.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-gray-700 hover:bg-brand-blue hover:text-white transition-colors p-3 rounded-full"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map Section */}
        <div className="mt-12 rounded-lg overflow-hidden shadow-sm h-[400px] bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Map would be embedded here in a production environment</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
