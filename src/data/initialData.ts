
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  featured: boolean;
  specifications?: Record<string, string>;
  colors?: string[];
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
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

export interface CompanyInfo {
  name: string;
  slogan: string;
  about: string;
  contact: {
    address: string;
    email: string;
    phone: string;
    socialMedia: {
      facebook: string;
      instagram: string;
      twitter: string;
    }
  };
}

export const categories: Category[] = [
  {
    id: "cat1",
    name: "Interior Paints",
    description: "High-quality paints for interior walls and ceilings",
    image: "/placeholder.svg"
  },
  {
    id: "cat2",
    name: "Exterior Paints",
    description: "Weather-resistant paints for exterior surfaces",
    image: "/placeholder.svg"
  },
  {
    id: "cat3",
    name: "Wood Finishes",
    description: "Stains and varnishes for wooden surfaces",
    image: "/placeholder.svg"
  },
  {
    id: "cat4",
    name: "Metal Paints",
    description: "Rust-proof paints for metal surfaces",
    image: "/placeholder.svg"
  },
  {
    id: "cat5",
    name: "Primers",
    description: "Preparation coatings for various surfaces",
    image: "/placeholder.svg"
  },
  {
    id: "cat6",
    name: "Specialty Coatings",
    description: "Specialized paints for specific applications",
    image: "/placeholder.svg"
  }
];

export const products: Product[] = [
  {
    id: "p1",
    name: "Premium Matte Wall Paint",
    description: "Superior quality matte finish paint for interior walls with excellent coverage and washability.",
    price: 25.99,
    categoryId: "cat1",
    image: "/placeholder.svg",
    featured: true,
    specifications: {
      "Coverage": "8-10 m²/L",
      "Dry Time": "1-2 hours",
      "Recoat Time": "4 hours",
      "VOC Content": "Low",
      "Finish": "Matte"
    },
    colors: ["White", "Off-White", "Beige", "Light Gray", "Sky Blue"]
  },
  {
    id: "p2",
    name: "Weather Shield Exterior Paint",
    description: "Long-lasting exterior paint with advanced weather protection technology.",
    price: 32.99,
    categoryId: "cat2",
    image: "/placeholder.svg",
    featured: true,
    specifications: {
      "Coverage": "6-8 m²/L",
      "Dry Time": "2-3 hours",
      "Recoat Time": "6 hours",
      "Weather Resistance": "Excellent",
      "Finish": "Satin"
    },
    colors: ["White", "Beige", "Tan", "Gray", "Blue", "Green"]
  },
  {
    id: "p3",
    name: "Wood Stain & Sealer",
    description: "Penetrating wood stain that enhances grain and protects against moisture.",
    price: 18.99,
    categoryId: "cat3",
    image: "/placeholder.svg",
    featured: false,
    specifications: {
      "Coverage": "10-12 m²/L",
      "Dry Time": "4-6 hours",
      "Recoat Time": "12 hours",
      "Water Resistance": "High",
      "Finish": "Natural"
    },
    colors: ["Cherry", "Walnut", "Oak", "Mahogany", "Ebony"]
  },
  {
    id: "p4",
    name: "Anti-Rust Metal Paint",
    description: "Directly applies to rust with no primer needed. Provides long-lasting protection.",
    price: 27.99,
    categoryId: "cat4",
    image: "/placeholder.svg",
    featured: true,
    specifications: {
      "Coverage": "7-9 m²/L",
      "Dry Time": "1-2 hours",
      "Recoat Time": "4 hours",
      "Rust Protection": "Advanced",
      "Finish": "Gloss"
    },
    colors: ["Black", "White", "Silver", "Red", "Blue"]
  },
  {
    id: "p5",
    name: "All-Surface Primer",
    description: "Universal primer suitable for all surfaces including difficult substrates.",
    price: 15.99,
    categoryId: "cat5",
    image: "/placeholder.svg",
    featured: false,
    specifications: {
      "Coverage": "8-10 m²/L",
      "Dry Time": "30 minutes",
      "Recoat Time": "1 hour",
      "Adhesion": "Superior",
      "Finish": "Flat"
    },
    colors: ["White"]
  },
  {
    id: "p6",
    name: "Concrete Floor Paint",
    description: "Durable epoxy-based paint for concrete floors with excellent wear resistance.",
    price: 38.99,
    categoryId: "cat6",
    image: "/placeholder.svg",
    featured: false,
    specifications: {
      "Coverage": "5-7 m²/L",
      "Dry Time": "6-8 hours",
      "Recoat Time": "24 hours",
      "Abrasion Resistance": "High",
      "Finish": "Semi-Gloss"
    },
    colors: ["Gray", "Beige", "Blue", "Green", "Red"]
  },
  {
    id: "p7",
    name: "Kitchen & Bath Paint",
    description: "Mildew-resistant paint specifically formulated for humid environments.",
    price: 29.99,
    categoryId: "cat1",
    image: "/placeholder.svg",
    featured: true,
    specifications: {
      "Coverage": "8-10 m²/L",
      "Dry Time": "1-2 hours",
      "Recoat Time": "4 hours",
      "Mildew Resistance": "Excellent",
      "Finish": "Semi-Gloss"
    },
    colors: ["White", "Off-White", "Light Blue", "Light Green", "Beige"]
  },
  {
    id: "p8",
    name: "High-Gloss Enamel",
    description: "Tough, durable high-gloss finish for trim, doors, and cabinets.",
    price: 26.99,
    categoryId: "cat1",
    image: "/placeholder.svg",
    featured: false,
    specifications: {
      "Coverage": "8-10 m²/L",
      "Dry Time": "4-6 hours",
      "Recoat Time": "16 hours",
      "Scratch Resistance": "High",
      "Finish": "High-Gloss"
    },
    colors: ["White", "Black", "Red", "Blue", "Green", "Yellow"]
  },
  {
    id: "p9",
    name: "Chalk Finish Paint",
    description: "Ultra-matte decorative paint perfect for furniture and DIY projects.",
    price: 19.99,
    categoryId: "cat6",
    image: "/placeholder.svg",
    featured: false,
    specifications: {
      "Coverage": "10-12 m²/L",
      "Dry Time": "30 minutes",
      "Recoat Time": "2 hours",
      "Adhesion": "Excellent",
      "Finish": "Ultra-Matte"
    },
    colors: ["White", "Gray", "Blue", "Green", "Pink", "Black"]
  },
  {
    id: "p10",
    name: "Heat Resistant Paint",
    description: "Specialized paint that withstands temperatures up to 650°C.",
    price: 24.99,
    categoryId: "cat6",
    image: "/placeholder.svg",
    featured: false,
    specifications: {
      "Coverage": "8-10 m²/L",
      "Dry Time": "1 hour",
      "Heat Resistance": "Up to 650°C",
      "Application": "Spray/Brush",
      "Finish": "Matte"
    },
    colors: ["Black", "Silver", "White"]
  }
];

export const banners: Banner[] = [
  {
    id: "b1",
    title: "Premium Quality Paints",
    subtitle: "Transform your space with our premium collection",
    image: "/placeholder.svg",
    ctaText: "Shop Now",
    ctaLink: "/products"
  },
  {
    id: "b2",
    title: "New Exterior Collection",
    subtitle: "Weather-resistant paints for lasting protection",
    image: "/placeholder.svg",
    ctaText: "Explore",
    ctaLink: "/products?category=cat2"
  },
  {
    id: "b3",
    title: "Professional Finish Guaranteed",
    subtitle: "Get perfect results every time",
    image: "/placeholder.svg",
    ctaText: "Learn More",
    ctaLink: "/about"
  }
];

export const companyInfo: CompanyInfo = {
  name: "Modern Paint Co.",
  slogan: "Colors that inspire, quality that lasts",
  about: "Modern Paint Co. has been a leading provider of high-quality paints and coatings since 1995. We are committed to innovation, sustainability, and customer satisfaction. Our products are designed to deliver exceptional performance while being environmentally responsible.",
  contact: {
    address: "123 Paint Street, Baghdad, Iraq",
    email: "info@modernpaint.com",
    phone: "+964 771 123 4567",
    socialMedia: {
      facebook: "https://facebook.com/modernpaint",
      instagram: "https://instagram.com/modernpaint",
      twitter: "https://twitter.com/modernpaint"
    }
  }
};
