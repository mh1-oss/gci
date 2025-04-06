export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  featured: boolean;
  colors: string[];
  specifications?: Record<string, string>;
  mediaGallery?: MediaItem[];
  specsPdf?: string;
  coverage?: number; // Adding coverage property for paint products
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  videoUrl?: string;
  mediaType: "image" | "video";
  ctaText?: string;
  ctaLink?: string;
  orderIndex: number;
  sliderHeight?: number;
  textColor?: string;
}

export interface Review {
  id: string;
  customerName: string;
  content: string;
  rating: number;
  position?: string;
  imageUrl?: string;
  isApproved?: boolean;
}

export interface CompanyInfo {
  name: string;
  slogan: string;
  about: string;
  logo: string;
  contact: {
    address: string;
    phone: string;
    email: string;
    socialMedia: Record<string, string>;
  };
  exchangeRate?: number;
}

// Sample data
export const products: Product[] = [
  {
    id: "p1",
    name: "طلاء أكريليك ممتاز",
    description: "طلاء أكريليك ممتاز يوفر تغطية استثنائية ومقاومة للتلاشي، مثالي للاستخدام الداخلي والخارجي.",
    price: 29.99,
    categoryId: "cat1",
    image: "/placeholder.svg",
    featured: true,
    colors: ["أبيض", "عاجي", "بيج"],
    specifications: {
      "النوع": "أكريليك",
      "التغطية": "8-10 متر مربع / لتر",
      "وقت الجفاف": "ساعة واحدة",
      "إعادة الطلاء": "4 ساعات",
      "اللمعان": "مطفي"
    }
  },
  {
    id: "p2",
    name: "طلاء الأسطح المعدنية المضاد للصدأ",
    description: "طلاء أساس ونهائي يحمي الأسطح المعدنية من الصدأ مع توفير تشطيب جميل ومتين.",
    price: 39.99,
    categoryId: "cat2",
    image: "/placeholder.svg",
    featured: true,
    colors: ["فضي", "أسود", "أحمر"]
  },
  {
    id: "p3",
    name: "طلاء أكريليك للخشب",
    description: "طلاء متخصص للأسطح الخشبية يعزز الجمال الطبيعي للخشب مع توفير حماية فائقة.",
    price: 45.99,
    categoryId: "cat3",
    image: "/placeholder.svg",
    featured: false,
    colors: ["شفاف لامع", "شفاف مطفي", "بني فاتح"]
  },
  {
    id: "p4",
    name: "طلاء الأسطح الخرسانية",
    description: "طلاء متين للأرضيات والأسطح الخرسانية، مقاوم للبقع والمواد الكيميائية المنزلية.",
    price: 52.99,
    categoryId: "cat4",
    image: "/placeholder.svg",
    featured: false,
    colors: ["رمادي", "بيج", "أخضر"]
  },
  {
    id: "p5",
    name: "طلاء الجدران الداخلية",
    description: "طلاء منخفض الرائحة وقابل للغسل، مثالي للغرف المعيشية وغرف النوم مع تغطية ممتازة.",
    price: 24.99,
    categoryId: "cat1",
    image: "/placeholder.svg",
    featured: true,
    colors: ["أبيض ناصع", "كريمي", "رمادي فاتح", "أزرق سماوي"]
  },
  {
    id: "p6",
    name: "طلاء الحمامات والمطابخ",
    description: "طلاء مقاوم للرطوبة والعفن، مصمم خصيصًا للأماكن ذات الرطوبة العالية.",
    price: 34.99,
    categoryId: "cat1",
    image: "/placeholder.svg",
    featured: false,
    colors: ["أبيض", "عاجي", "أزرق فاتح"]
  },
  {
    id: "p7",
    name: "طلاء أيبوكسي لل��رضيات",
    description: "طلاء أيبوكسي عالي الأداء للمرائب وأرضيات الورش والمستودعات.",
    price: 69.99,
    categoryId: "cat4",
    image: "/placeholder.svg",
    featured: true,
    colors: ["رمادي", "أسود", "أزرق"]
  },
  {
    id: "p8",
    name: "طلاء الأسقف",
    description: "طلاء خاص للأسقف بتغطية ممتازة ومقاومة للتكثيف والبقع.",
    price: 22.99,
    categoryId: "cat1",
    image: "/placeholder.svg",
    featured: false,
    colors: ["أبيض فائق"]
  }
];

// Export the products array as initialProducts for backward compatibility
export const initialProducts = products;

export const categories: Category[] = [
  {
    id: "cat1",
    name: "الطلاء الداخلي",
    description: "طلاء عالي الجودة للجدران والأسقف الداخلية",
    image: "/placeholder.svg"
  },
  {
    id: "cat2",
    name: "الطلاء الخارجي",
    description: "طلاء مقاوم للعوامل الجوية للاستخدام الخارجي",
    image: "/placeholder.svg"
  },
  {
    id: "cat3",
    name: "الطلاء الخشبي",
    description: "أصباغ وورنيش للأسطح الخشبية",
    image: "/placeholder.svg"
  },
  {
    id: "cat4",
    name: "طلاء الأرضيات",
    description: "طلاء متخصص للأرضيات الخرسانية والخشبية",
    image: "/placeholder.svg"
  }
];

export const banners: Banner[] = [
  {
    id: "banner1",
    title: "أفضل أنواع الطلاء بأفضل الأسعار",
    subtitle: "اكتشف مجموعتنا من الطلاء عالي الجودة للمشاريع الداخلية والخارجية",
    image: "/placeholder.svg",
    ctaText: "تسوق الآن",
    ctaLink: "/products",
    mediaType: 'image',
    videoUrl: null,
    orderIndex: 0
  },
  {
    id: "banner2",
    title: "خصم 20% على الطلاء الخارجي",
    subtitle: "حماية متميزة ضد العوامل الجوية مع ألوان لا تتلاشى",
    image: "/placeholder.svg",
    ctaText: "اكتشف العروض",
    ctaLink: "/products?category=cat2",
    mediaType: 'image',
    videoUrl: null,
    orderIndex: 1
  },
  {
    id: "banner3",
    title: "الكمية المناسبة لكل مشروع",
    subtitle: "استخدم حاسبة الطلاء الخاصة بنا لتحديد الكمية المناسبة",
    image: "/placeholder.svg",
    ctaText: "حاسبة الطلاء",
    ctaLink: "/calculator",
    mediaType: 'image',
    videoUrl: null,
    orderIndex: 2
  }
];

export const companyInfo: CompanyInfo = {
  name: "GSI",
  logo: "/gci-logo.png",
  slogan: "أفضل منتجات الطلاء بأعلى جودة",
  about: "تأسست شركة GSI وهي رائدة في مجال صناعة الدهانات والطلاء في العراق. نحن نقدم منتجات عالية الجودة تلبي احتياجات عملائنا من الأفراد والشركات.",
  contact: {
    address: "123 شارع الصناعة، بغداد، العراق",
    phone: "+964 771 234 5678",
    email: "info@gci.iq",
    socialMedia: {
      facebook: "https://facebook.com/gci",
      twitter: "https://twitter.com/gci",
      instagram: "https://instagram.com/gci"
    }
  },
  exchangeRate: 1460 // 1 USD = 1460 IQD (example rate)
};
