
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { categories } from "@/data/initialData";
import { fetchCategories } from "@/services/categories/categoryService";
import { Menu, X, ChevronDown, Settings, ShoppingCart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CartButton from "@/components/Cart/CartButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMobile } from "@/hooks/use-mobile";

const Header = () => {
  const location = useLocation();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [categoryData, setCategoryData] = useState(categories);
  const { isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        if (data) {
          setCategoryData(data);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    
    loadCategories();
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="border-b sticky top-0 z-50 bg-white" dir="rtl">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img src="/gci-logo.png" alt="GCI Logo" className="h-10" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:ml-6 md:flex md:space-x-8 md:space-x-reverse">
            <Link
              to="/"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                location.pathname === "/"
                  ? "text-brand-blue border-brand-blue"
                  : "text-gray-500 border-transparent hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              الرئيسية
            </Link>
            <div className="relative group">
              <button
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 group ${
                  location.pathname.startsWith("/products")
                    ? "text-brand-blue border-brand-blue"
                    : "text-gray-500 border-transparent hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                المنتجات
                <ChevronDown className="h-4 w-4 mr-1 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute -left-4 transform top-full p-2 mt-1 w-48 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link
                    to="/products"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    جميع المنتجات
                  </Link>
                  <div className="border-t my-1"></div>
                  {categoryData.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link
              to="/about"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                location.pathname === "/about"
                  ? "text-brand-blue border-brand-blue"
                  : "text-gray-500 border-transparent hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              من نحن
            </Link>
            <Link
              to="/contact"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                location.pathname === "/contact"
                  ? "text-brand-blue border-brand-blue"
                  : "text-gray-500 border-transparent hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              اتصل بنا
            </Link>
            <Link
              to="/visualizer"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                location.pathname === "/visualizer"
                  ? "text-brand-blue border-brand-blue"
                  : "text-gray-500 border-transparent hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              محاكي الألوان
            </Link>
            <Link
              to="/calculator"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                location.pathname === "/calculator"
                  ? "text-brand-blue border-brand-blue"
                  : "text-gray-500 border-transparent hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              حاسبة الطلاء
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            <CartButton />

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand-blue text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="left">
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Settings className="ml-2 h-4 w-4" />
                        لوحة التحكم
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">تسجيل الدخول</Link>
              </Button>
            )}

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="sr-only">
                  {isOpen ? "إغلاق القائمة" : "فتح القائمة"}
                </span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`md:hidden ${isOpen ? "block" : "hidden"}`}
        id="mobile-menu"
      >
        <div className="pt-2 pb-4 space-y-1">
          <Link
            to="/"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              location.pathname === "/"
                ? "text-brand-blue border-r-4 border-brand-blue bg-indigo-50"
                : "text-gray-500 border-r-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            الرئيسية
          </Link>
          <Link
            to="/products"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              location.pathname.startsWith("/products")
                ? "text-brand-blue border-r-4 border-brand-blue bg-indigo-50"
                : "text-gray-500 border-r-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            المنتجات
          </Link>
          {/* Categories submenu for mobile */}
          <div className="pl-6 space-y-1">
            {categoryData.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="block pl-3 pr-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              >
                {category.name}
              </Link>
            ))}
          </div>
          <Link
            to="/about"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              location.pathname === "/about"
                ? "text-brand-blue border-r-4 border-brand-blue bg-indigo-50"
                : "text-gray-500 border-r-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            من نحن
          </Link>
          <Link
            to="/contact"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              location.pathname === "/contact"
                ? "text-brand-blue border-r-4 border-brand-blue bg-indigo-50"
                : "text-gray-500 border-r-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            اتصل بنا
          </Link>
          <Link
            to="/visualizer"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              location.pathname === "/visualizer"
                ? "text-brand-blue border-r-4 border-brand-blue bg-indigo-50"
                : "text-gray-500 border-r-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            محاكي الألوان
          </Link>
          <Link
            to="/calculator"
            className={`block pl-3 pr-4 py-2 text-base font-medium ${
              location.pathname === "/calculator"
                ? "text-brand-blue border-r-4 border-brand-blue bg-indigo-50"
                : "text-gray-500 border-r-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            حاسبة الطلاء
          </Link>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 border-r-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            >
              تسجيل الدخول
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 border-r-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            >
              لوحة التحكم
            </Link>
          )}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full text-right block pl-3 pr-4 py-2 text-base font-medium text-gray-500 border-r-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            >
              تسجيل الخروج
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
