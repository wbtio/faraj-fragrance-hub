import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  FolderTree, 
  Home, 
  ShoppingCart,
  Users,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AdminHeader = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: "لوحة التحكم" },
    { path: "/admin/products", icon: Package, label: "إدارة المنتجات" },
    { path: "/admin/brands", icon: Tag, label: "إدارة البراندات" },
    { path: "/admin/categories", icon: FolderTree, label: "إدارة الفئات" },
    { path: "/admin/homepage", icon: Home, label: "إدارة الصفحة الرئيسية" },
    { path: "/admin/orders", icon: ShoppingCart, label: "إدارة الطلبات" },
    { path: "/admin/customers", icon: Users, label: "إدارة العملاء" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-background border-b sticky top-0 z-50" dir="rtl">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/admin" className="flex items-center gap-1.5 md:gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base md:text-xl font-bold">لوحة التحكم</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Faraj Fragrance Hub</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="text-xs md:text-sm px-2 md:px-3">
                <span className="hidden sm:inline">عرض الموقع</span>
                <Home className="h-4 w-4 sm:hidden" />
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">تسجيل الخروج</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="lg:hidden pb-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1.5 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    className="gap-1.5 whitespace-nowrap text-xs px-2.5 h-8"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
