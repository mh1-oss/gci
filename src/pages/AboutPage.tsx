import { useState, useEffect } from "react";
import { fetchCompanyInfo } from "@/services/company/companyService";
import { CompanyInfo } from "@/data/initialData";

const AboutPage = () => {
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
    document.title = "عن الشركة - الشركة الذهبية للصناعات الكيمياوية";
    
    const fetchCompanyInfo = async () => {
      const info = await fetchCompanyInfo();
      if (info) {
        setCompanyInfo({
          ...info,
          exchangeRate: info.exchangeRate || 1
        });
      }
    };
    
    fetchCompanyInfo();
  }, []);

  if (!companyInfo) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="container-custom">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">عن {companyInfo.name}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {companyInfo.slogan}
          </p>
        </div>

        {/* About Us Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">قصة الشركة</h2>
            <p className="text-gray-700 mb-4">
              {companyInfo.about}
            </p>
            <p className="text-gray-700">
              في الشركة الذهبية للصناعات الكيمياوية، نؤمن بأن الجودة لا يجب أن تتأثر. نعمل بجدية لتطوير حلول صناعية مبتكرة تقدم نتائج فريدة مع مراعاة المسؤولية البيئية والرضاعة العميلة.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-md">
            <img 
              src="/placeholder.svg" 
              alt="عن الشركة - الشركة الذهبية للصناعات الكيمياوية" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">مهمتنا</h2>
              <p className="text-gray-700">
                نهدف إلى تقديم حلول صناعية عالية الجودة ومتقدمة تعزز التأثير والحماية من الأسطح، مع حفظ اهتمامنا بالمسؤولية البيئية والرضاعة العميلة والخدمة العميلة.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">رؤيةنا</h2>
              <p className="text-gray-700">
                نسعى إلى أن نكون الشركة الرائدة في تقديم منتجات صناعية في العراق، معتمدة على الجودة والتميز والخدمة العميقة، وساهمة في تزيين وحماية المكانات عبر البلاد.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">قيمنا الأساسية</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-brand-blue text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">جودة</h3>
              <p className="text-gray-600">
                نحن نلتزم بالتميز في كل منتج الذي نصنع، لضمان قدرة الاستمرارية والفعالية.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-brand-teal text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">تركيز العميل</h3>
              <p className="text-gray-600">
                نحن نسمع إلى احتياجات عملائنا ونستمر في تحسين منتجاتنا وخدماتنا.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-brand-lightblue text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">الصدق</h3>
              <p className="text-gray-600">
                نعمل بصدق، التفاصيل والمبادئ الأخلاقية في جميع أعمالنا.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="bg-brand-gray text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">البيئة</h3>
              <p className="text-gray-600">
                نحن نركز على المنتجات البيئية والسياسات التجارية المستدامة.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h2 className="text-2xl font-bold mb-8 text-center">فريقنا المتميز</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square">
                <img 
                  src="/placeholder.svg" 
                  alt="الرئيس التنفيذي" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">محمد الجبوري</h3>
                <p className="text-brand-blue mb-3">رئيس التنفيذي ومؤسس</p>
                <p className="text-gray-600">
                  مع أكثر من 20 عاماً من経験 في قطاع الصناعة، يقود الشركة برؤية وخبرة ممتازة.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square">
                <img 
                  src="/placeholder.svg" 
                  alt="رئيس التكنولوجيا المعلوماتية" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">ليلا حسن</h3>
                <p className="text-brand-blue mb-3">رئيس التكنولوجيا المعلوماتية</p>
                <p className="text-gray-600">
                  يدير قسم البحث والتطوير لدينا، حيث يجمع التكنولوجيا والتميز في تطوير منتجاتنا.
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-square">
                <img 
                  src="/placeholder.svg" 
                  alt="رئيس العمليات" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-1">أحمد محمود</h3>
                <p className="text-brand-blue mb-3">رئيس العمليات</p>
                <p className="text-gray-600">
                  يضمن أن عملياتنا تعمل بشكل جيد، وضمانة أعلى مستويات الجودة والفعالية.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
