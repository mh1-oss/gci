
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCategories } from "@/services/dataService";
import { Category } from "@/data/initialData";
import { 
  Menu, 
  X, 
  User, 
  DollarSign, 
  ShoppingCart, 
  ChevronDown,
  CreditCard,
  LogOut,
  Settings,
  LayoutDashboard
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const location = useLocation();

  // Load categories
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleCurrency = () => {
    setCurrency(currency === "USD" ? "IQD" : "USD");
  };

  return (
    <header className={`sticky top-0 z-50 bg-white shadow-sm transition-all duration-300 ${isScrolled ? "py-2" : "py-4"}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-brand-blue">
            Modern<span className="text-brand-teal">Paint</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-brand-blue transition-colors">
              Home
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="inline-flex items-center">
                  Products <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56">
                <DropdownMenuLabel>Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/products" className="w-full">All Products</Link>
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link to={`/products?category=${category.id}`} className="w-full">
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Link to="/about" className="text-gray-700 hover:text-brand-blue transition-colors">
              About
            </Link>
            
            <Link to="/contact" className="text-gray-700 hover:text-brand-blue transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Side Menu Items */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleCurrency}
              className="flex items-center gap-1"
            >
              <DollarSign className="h-4 w-4" />
              {currency}
            </Button>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {user?.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center w-full">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500 flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleCurrency}
              className="flex items-center gap-1"
            >
              <DollarSign className="h-4 w-4" />
              {currency}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg animate-slide-in z-50">
          <nav className="flex flex-col py-4 px-6 space-y-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-brand-blue py-2 transition-colors"
            >
              Home
            </Link>
            
            <div className="py-2">
              <p className="text-gray-500 mb-2 text-sm font-medium">Products</p>
              <div className="pl-4 space-y-2">
                <Link 
                  to="/products" 
                  className="block text-gray-700 hover:text-brand-blue transition-colors"
                >
                  All Products
                </Link>
                {categories.map((category) => (
                  <Link 
                    key={category.id}
                    to={`/products?category=${category.id}`} 
                    className="block text-gray-700 hover:text-brand-blue transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-brand-blue py-2 transition-colors"
            >
              About
            </Link>
            
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-brand-blue py-2 transition-colors"
            >
              Contact
            </Link>
            
            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-100 pt-2">
                  <p className="text-gray-500 mb-2 text-sm font-medium">Account</p>
                  <div className="pl-4 space-y-2">
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="block text-gray-700 hover:text-brand-blue transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link 
                      to="/orders" 
                      className="block text-gray-700 hover:text-brand-blue transition-colors"
                    >
                      Orders
                    </Link>
                    <Link 
                      to="/settings" 
                      className="block text-gray-700 hover:text-brand-blue transition-colors"
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={logout}
                      className="block w-full text-left text-red-500 hover:text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link 
                to="/login" 
                className="bg-brand-blue text-white py-2 px-4 rounded-md text-center hover:bg-brand-darkblue transition-colors"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
