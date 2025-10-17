import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const menuItems = [
    { label: "الرئيسية", href: "/" },
    { label: "عطور رجالية", href: "/products?category=men" },
    { label: "عطور نسائية", href: "/products?category=women" },
    { label: "عطور للجنسين", href: "/products?category=unisex" },
    { label: "عطور الشعر", href: "/products?category=hair" },
    { label: "أحدث العطور", href: "/products?category=new" },
    { label: "العروض الخاصة", href: "/products?category=offers" },
  ];

  const handleAuthClick = () => {
    if (isAuthenticated) {
      // If user is admin, go to admin dashboard
      if (user?.username === "admin") {
        navigate("/admin");
      } else {
        // For regular users, show profile options
        // For now, we'll just logout
        logout();
      }
    } else {
      navigate("/login");
    }
  };

  const handleCartClick = () => {
    navigate("/cart");
  };

  const handleSearchClick = () => {
    navigate("/search");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm">
      {/* Free Shipping Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-purple-600 to-primary animate-gradient-x">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="container mx-auto px-4 relative">
          <p className="text-sm font-bold text-white text-center py-2 animate-pulse">
            <span className="tracking-wide">توصيل مجاني للطلبات فوق 50,000 دينار عراقي</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Main Header */}
        <div className="flex items-center justify-between py-3" dir="rtl">
          {/* Right Side - Menu Button */}
          <div className="flex items-center gap-2 w-[120px] lg:w-auto">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Center - Logo */}
          <Link to="/" className="flex items-center absolute left-1/2 transform -translate-x-1/2">
            <img 
              src="/logo.svg" 
              alt="فرح لبيع العطور" 
              className="h-10 md:h-12 w-auto drop-shadow-sm"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
            />
          </Link>

          {/* Left Side - Actions */}
          <div className="flex items-center gap-0.5 w-[120px] justify-end">
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent" onClick={handleSearchClick}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-accent" onClick={handleCartClick}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent" onClick={handleAuthClick}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Desktop Navigation - Below Header */}
        <nav className="hidden lg:flex items-center justify-center gap-8 py-3 border-t border-border/30">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full hover:after:left-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border/50" dir="rtl">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="block py-3 text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};