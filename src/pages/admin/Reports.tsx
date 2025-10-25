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
import { Calendar } from "lucide-react";

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
      const { data: allOrders } = await supabase.from("orders").select("status");
      if (allOrders) {
        const statusCounts = countByStatus(allOrders);
        setOrdersByStatus(statusCounts);
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
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-8 w-8 text-blue-500" />
            <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
          </div>
          <p className="text-muted-foreground">
            عرض شامل للبيانات والإحصائيات المتعلقة بالطلبات والمنتجات
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Orders by Date - Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>الطلبات حسب التاريخ</CardTitle>
              <CardDescription>عدد الطلبات في آخر 30 يوم</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ordersByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    name="عدد الطلبات"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 2. Orders by Status - Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>الطلبات حسب الحالة</CardTitle>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 3. Top Products - Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
              <CardDescription>المنتجات الأكثر طلباً</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#10b981" name="عدد المبيعات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 4. Products by Category - Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>المنتجات حسب الفئة</CardTitle>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 5. Revenue by Month - Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات حسب الشهر</CardTitle>
              <CardDescription>إجمالي الإيرادات الشهرية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
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
          <Card>
            <CardHeader>
              <CardTitle>حالة الدفع</CardTitle>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 7. Order Trend - Line Chart with Area */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه الطلبات</CardTitle>
              <CardDescription>تطور عدد الطلبات بمرور الوقت</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={orderTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
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
          <Card>
            <CardHeader>
              <CardTitle>أفضل المنتجات بالإيرادات</CardTitle>
              <CardDescription>المنتجات الأكثر إيراداً</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#ec4899" name="الإيرادات (د.ع)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 9. Category Distribution - Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع الفئات</CardTitle>
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
                  <Tooltip />
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
