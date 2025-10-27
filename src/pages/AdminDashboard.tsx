import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { 
  Package, 
  Tag, 
  LayoutGrid, 
  Home, 
  ShoppingCart, 
  Users,
  LogOut,
  Settings,
  Bell,
  BarChart3,
  CheckCircle,
  X
} from "lucide-react";

const AdminDashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalBrands: 0,
    totalCategories: 0,
    totalOrders: 0,
  });
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      fetchStats();
      // Show notification for 5 seconds then auto-hide
      const timer = setTimeout(() => setShowNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  const fetchStats = async () => {
    try {
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const { count: brandCount } = await supabase
        .from("brands")
        .select("*", { count: "exact", head: true });

      const { count: categoryCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      const { count: orderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      setStats({
        totalProducts: productCount || 0,
        totalBrands: brandCount || 0,
        totalCategories: categoryCount || 0,
        totalOrders: orderCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    {
      title: "إدارة المنتجات",
      description: "إضافة وتعديل وحذف المنتجات",
      icon: Package,
      path: "/admin/products",
      color: "bg-blue-500",
    },
    {
      title: "إدارة البراندات",
      description: "إدارة وترتيب البراندات",
      icon: Tag,
      path: "/admin/brands",
      color: "bg-purple-500",
    },
    {
      title: "إدارة الفئات",
      description: "إدارة فئات المنتجات",
      icon: LayoutGrid,
      path: "/admin/categories",
      color: "bg-green-500",
    },
    {
      title: "إدارة الصفحة الرئيسية",
      description: "ترتيب المنتجات والأقسام",
      icon: Home,
      path: "/admin/homepage",
      color: "bg-orange-500",
    },
    {
      title: "إدارة الطلبات",
      description: "عرض وإدارة الطلبات",
      icon: ShoppingCart,
      path: "/admin/orders",
      color: "bg-red-500",
    },
    {
      title: "إدارة العملاء",
      description: "عرض وإدارة العملاء",
      icon: Users,
      path: "/admin/customers",
      color: "bg-indigo-500",
    },
    {
      title: "إعدادات النظام",
      description: "إعدادات عامة للنظام",
      icon: Settings,
      path: "/admin/settings",
      color: "bg-gray-500",
    },
    {
      title: "طلبات الإشعارات",
      description: "إدارة طلبات إشعارات المنتجات",
      icon: Bell,
      path: "/admin/notifications",
      color: "bg-purple-500",
    },
    {
      title: "التقارير والإحصائيات",
      description: "عرض التقارير والمخططات البيانية",
      icon: BarChart3,
      path: "/admin/reports",
      color: "bg-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8" dir="rtl">
        {/* Welcome Notification */}
        {showNotification && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-green-500 rounded-lg mt-1">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-900 mb-1">تم إنجاز صفحة التقارير ✓</h3>
                      <p className="text-green-800 mb-2">
                        تم تصميم وإطلاق صفحة التقارير والإحصائيات الشاملة بقيمة <span className="font-bold">80,000 د.ع</span>
                      </p>
                      <p className="text-sm text-green-700">
                        جميع التعديلات والتحسينات المتبقية مشمولة ضمن هذا المبلغ. الصفحة متصلة بقاعدة البيانات بالكامل وتعرض 9 مخططات بيانية متقدمة.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotification(false)}
                    className="text-green-600 hover:text-green-800 transition-colors mt-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">
            مرحباً، {user?.username}
          </p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">المنتجات</p>
                  <p className="text-3xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">البراندات</p>
                  <p className="text-3xl font-bold">{stats.totalBrands}</p>
                </div>
                <Tag className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الفئات</p>
                  <p className="text-3xl font-bold">{stats.totalCategories}</p>
                </div>
                <LayoutGrid className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">الطلبات</p>
                  <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-12 w-12 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(item.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
