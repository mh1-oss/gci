
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { fetchCompanyInfo } from "@/services/company/companyService";
import { CompanyInfo } from "@/data/initialData";

const Footer = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    slogan: '',
    about: '',
    logo: '',
    contact: {
      address: '',
      phone: '',
      email: '',
      socialMedia: {}
    },
    exchangeRate: 1
  });

  useEffect(() => {
    const fetchData = async () => {
      const info = await fetchCompanyInfo();
      if (info) {
        setCompanyInfo({
          ...info,
          exchangeRate: info.exchangeRate || 1
        });
      }
    };
    
    fetchData();
  }, []);

  if (!companyInfo) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              {companyInfo.name}
            </h3>
            <p className="text-gray-300 mb-4">{companyInfo.slogan}</p>
            <div className="flex space-x-4">
              <a 
                href={companyInfo.contact.socialMedia.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href={companyInfo.contact.socialMedia.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href={companyInfo.contact.socialMedia.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-gray-300 hover:text-white transition-colors">
                  حاسبة الطلاء
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">اتصل بنا</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" />
                <span className="text-gray-300">{companyInfo.contact.address}</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0" />
                <span className="text-gray-300">{companyInfo.contact.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0" />
                <a 
                  href={`mailto:${companyInfo.contact.email}`} 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {companyInfo.contact.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">النشرة الإخبارية</h3>
            <p className="text-gray-300 mb-4">
              اشترك في نشرتنا الإخبارية للحصول على تحديثات حول المنتجات الجديدة والعروض الخاصة.
            </p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-lightblue transition-colors"
              >
                اشترك
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-gray-400 text-sm text-center">
          <p>© {new Date().getFullYear()} {companyInfo.name}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
