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
  Bell
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      fetchStats();
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
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8" dir="rtl">
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
