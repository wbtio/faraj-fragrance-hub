import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts";
import { Calendar, TrendingUp, DollarSign, ShoppingCart, Users, AlertCircle } from "lucide-react";

interface OrderData {
  date: string;
  count: number;
  amount: number;
}

interface ProductData {
  name: string;
  sales: number;
  revenue: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface CategoryData {
  category: string;
  count: number;
}

const Reports = () => {
  const [ordersByDate, setOrdersByDate] = useState<OrderData[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<StatusData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<CategoryData[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<OrderData[]>([]);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<StatusData[]>([]);
  const [orderTrend, setOrderTrend] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    completedOrders: 0,
  });

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);

      // 1. Orders by Date (آخر 30 يوم)
      const { data: ordersData } = await supabase
        .from("orders")
        .select("created_at, total_amount")
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (ordersData) {
        const groupedByDate = groupByDate(ordersData);
        setOrdersByDate(groupedByDate);
        setOrderTrend(groupedByDate);
      }

      // 2. Orders by Status
      const { data: allOrders } = await supabase.from("orders").select("status, total_amount, customer_name");
      if (allOrders) {
        const statusCounts = countByStatus(allOrders);
        setOrdersByStatus(statusCounts);
        
        // Calculate summary stats
        const totalRevenue = allOrders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);
        const completedCount = allOrders.filter((o: any) => o.status === "completed").length;
        const uniqueCustomers = new Set(allOrders.map((o: any) => o.customer_name)).size;
        
        setSummaryStats({
          totalOrders: allOrders.length,
          totalRevenue,
          totalCustomers: uniqueCustomers,
          completedOrders: completedCount,
        });
      }

      // 3. Top Products
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_name_ar, quantity, price");

      if (orderItems) {
        const topProds = getTopProducts(orderItems);
        setTopProducts(topProds);
      }

      // 4. Products by Category
      const { data: products } = await supabase
        .from("products")
        .select("category");

      if (products) {
        const categoryCounts = countByCategory(products);
        setProductsByCategory(categoryCounts);
      }

      // 5. Revenue by Month
      const { data: monthlyOrders } = await supabase
        .from("orders")
        .select("created_at, total_amount");

      if (monthlyOrders) {
        const monthlyRevenue = groupByMonth(monthlyOrders);
        setRevenueByMonth(monthlyRevenue);
      }

      // 6. Customer Orders Distribution
      const { data: customerOrdersData } = await supabase
        .from("orders")
        .select("customer_name, id")
        .limit(10);

      if (customerOrdersData) {
        const customerCounts = customerOrdersData.map((order: any) => ({
          name: order.customer_name,
          orders: 1,
        }));
        setCustomerOrders(customerCounts);
      }

      // 7. Payment Status
      const { data: paymentData } = await supabase.from("orders").select("payment_status");
      if (paymentData) {
        const paymentCounts = countByPaymentStatus(paymentData);
        setPaymentStatus(paymentCounts);
      }
    } catch (error) {
      console.error("Error fetching reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (data: any[]) => {
    const grouped: Record<string, { count: number; amount: number }> = {};
    data.forEach((order) => {
      const date = new Date(order.created_at).toLocaleDateString("ar-IQ");
      if (!grouped[date]) {
        grouped[date] = { count: 0, amount: 0 };
      }
      grouped[date].count++;
      grouped[date].amount += order.total_amount || 0;
    });

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        count: data.count,
        amount: data.amount,
      }))
      .slice(-30);
  };

  const groupByMonth = (data: any[]) => {
    const grouped: Record<string, { count: number; amount: number }> = {};
    data.forEach((order) => {
      const date = new Date(order.created_at);
      const month = date.toLocaleDateString("ar-IQ", { year: "numeric", month: "long" });
      if (!grouped[month]) {
        grouped[month] = { count: 0, amount: 0 };
      }
      grouped[month].count++;
      grouped[month].amount += order.total_amount || 0;
    });

    return Object.entries(grouped).map(([date, data]) => ({
      date,
      count: data.count,
      amount: data.amount,
    }));
  };

  const countByStatus = (data: any[]) => {
    const counts: Record<string, number> = {};
    data.forEach((order) => {
      const status = order.status || "unknown";
      counts[status] = (counts[status] || 0) + 1;
    });

    const statusLabels: Record<string, string> = {
      pending: "قيد الانتظار",
      processing: "قيد المعالجة",
      completed: "مكتمل",
      cancelled: "ملغي",
    };

    return Object.entries(counts).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
    }));
  };

  const countByPaymentStatus = (data: any[]) => {
    const counts: Record<string, number> = {};
    data.forEach((order) => {
      const status = order.payment_status || "unknown";
      counts[status] = (counts[status] || 0) + 1;
    });

    const paymentLabels: Record<string, string> = {
      pending: "قيد الانتظار",
      completed: "مكتمل",
      failed: "فشل",
    };

    return Object.entries(counts).map(([status, count]) => ({
      name: paymentLabels[status] || status,
      value: count,
    }));
  };

  const countByCategory = (data: any[]) => {
    const counts: Record<string, number> = {};
    data.forEach((product) => {
      const category = product.category || "بدون فئة";
      counts[category] = (counts[category] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([category, count]) => ({
        category,
        count,
      }))
      .slice(0, 8);
  };

  const getTopProducts = (data: any[]) => {
    const productMap: Record<string, { sales: number; revenue: number }> = {};
    data.forEach((item) => {
      const name = item.product_name_ar || "منتج بدون اسم";
      if (!productMap[name]) {
        productMap[name] = { sales: 0, revenue: 0 };
      }
      productMap[name].sales += item.quantity || 0;
      productMap[name].revenue += (item.quantity || 0) * (item.price || 0);
    });

    return Object.entries(productMap)
      .map(([name, data]) => ({
        name,
        sales: data.sales,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 8);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-muted-foreground">جاري تحميل التقارير...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8" dir="rtl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              التقارير والإحصائيات
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            عرض شامل للبيانات والإحصائيات المتعلقة بالطلبات والمنتجات والعملاء
          </p>
        </div>

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Orders */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">إجمالي الطلبات</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{summaryStats.totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-500 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">إجمالي الإيرادات</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{summaryStats.totalRevenue.toLocaleString()} د.ع</p>
                </div>
                <div className="p-3 bg-green-500 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Customers */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">إجمالي العملاء</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{summaryStats.totalCustomers}</p>
                </div>
                <div className="p-3 bg-purple-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Orders */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">الطلبات المكتملة</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{summaryStats.completedOrders}</p>
                </div>
                <div className="p-3 bg-orange-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Orders by Date - Line Chart */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">الطلبات حسب التاريخ</CardTitle>
              <CardDescription>عدد الطلبات في آخر 30 يوم</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ordersByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="عدد الطلبات"
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 2. Orders by Status - Pie Chart */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">الطلبات حسب الحالة</CardTitle>
              <CardDescription>توزيع حالات الطلبات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 3. Top Products - Bar Chart */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">أفضل المنتجات مبيعاً</CardTitle>
              <CardDescription>المنتجات الأكثر طلباً</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                  <Legend />
                  <Bar dataKey="sales" fill="#10b981" name="عدد المبيعات" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 4. Products by Category - Pie Chart */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">المنتجات حسب الفئة</CardTitle>
              <CardDescription>توزيع المنتجات على الفئات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, count }) => `${category}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {productsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 5. Revenue by Month - Area Chart */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">الإيرادات حسب الشهر</CardTitle>
              <CardDescription>إجمالي الإيرادات الشهرية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#f59e0b"
                    fill="#fef3c7"
                    name="الإيرادات (د.ع)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 6. Payment Status - Pie Chart */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">حالة الدفع</CardTitle>
              <CardDescription>توزيع حالات الدفع</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 7. Order Trend - Line Chart with Area */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">اتجاه الطلبات</CardTitle>
              <CardDescription>تطور عدد الطلبات بمرور الوقت</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={orderTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    fill="#ede9fe"
                    name="عدد الطلبات"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 8. Top Products Revenue - Bar Chart */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">أفضل المنتجات بالإيرادات</CardTitle>
              <CardDescription>المنتجات الأكثر إيراداً</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#ec4899" name="الإيرادات (د.ع)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 9. Category Distribution - Radar Chart */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">توزيع الفئات</CardTitle>
              <CardDescription>مقارنة عدد المنتجات في كل فئة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={productsByCategory}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis />
                  <Radar
                    name="عدد المنتجات"
                    dataKey="count"
                    stroke="#14b8a6"
                    fill="#14b8a6"
                    fillOpacity={0.6}
                  />
                  <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
