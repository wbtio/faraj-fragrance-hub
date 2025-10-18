import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, MessageCircle, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  customer_city?: string;
  total_amount: number;
  status: string;
  payment_status: string;
  notes?: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_name_ar: string;
  brand: string;
  price: number;
  quantity: number;
  subtotal: number;
}

const OrdersManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل الطلبات",
        variant: "destructive",
      });
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      console.error("Error fetching order items:", error);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone.includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الطلب بنجاح",
      });

      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الطلب",
        variant: "destructive",
      });
    }
  };

  const openWhatsApp = (phone: string, orderNumber: string, customerName: string) => {
    // Remove any non-digit characters from phone
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `مرحباً ${customerName}، بخصوص طلبك رقم ${orderNumber}`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: "قيد الانتظار", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
      processing: { label: "قيد المعالجة", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
      completed: { label: "مكتمل", className: "bg-green-100 text-green-800 hover:bg-green-100" },
      cancelled: { label: "ملغي", className: "bg-red-100 text-red-800 hover:bg-red-100" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
        <p className="text-muted-foreground mt-1">
          عرض وإدارة جميع الطلبات مع إمكانية التواصل عبر واتساب
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="processing">قيد المعالجة</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>رقم الطلب</TableHead>
              <TableHead>اسم العميل</TableHead>
              <TableHead className="bg-blue-50">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  رقم واتساب
                </div>
              </TableHead>
              <TableHead>المدينة</TableHead>
              <TableHead>المبلغ الإجمالي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell className="bg-blue-50/50">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{order.customer_phone}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => openWhatsApp(order.customer_phone, order.order_number, order.customer_name)}
                      title="تواصل عبر واتساب"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{order.customer_city || "-"}</TableCell>
                <TableCell className="font-semibold">{order.total_amount.toLocaleString()} د.ع</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue>{getStatusBadge(order.status)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="processing">قيد المعالجة</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="h-4 w-4 ml-2" />
                    التفاصيل
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد طلبات
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              معلومات كاملة عن الطلب والعميل
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg mb-3">معلومات العميل</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm text-muted-foreground">الاسم:</span>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">رقم الهاتف:</span>
                    <div className="flex items-center gap-2">
                      <p className="font-medium font-mono">{selectedOrder.customer_phone}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-green-600 hover:text-green-700"
                        onClick={() => openWhatsApp(selectedOrder.customer_phone, selectedOrder.order_number, selectedOrder.customer_name)}
                      >
                        <MessageCircle className="h-3 w-3 ml-1" />
                        واتساب
                      </Button>
                    </div>
                  </div>
                  {selectedOrder.customer_email && (
                    <div>
                      <span className="text-sm text-muted-foreground">البريد الإلكتروني:</span>
                      <p className="font-medium">{selectedOrder.customer_email}</p>
                    </div>
                  )}
                  {selectedOrder.customer_city && (
                    <div>
                      <span className="text-sm text-muted-foreground">المدينة:</span>
                      <p className="font-medium">{selectedOrder.customer_city}</p>
                    </div>
                  )}
                  {selectedOrder.customer_address && (
                    <div className="col-span-2">
                      <span className="text-sm text-muted-foreground">العنوان:</span>
                      <p className="font-medium">{selectedOrder.customer_address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">المنتجات</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <div>
                        <p className="font-medium">{item.product_name_ar}</p>
                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{item.subtotal.toLocaleString()} د.ع</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {item.price.toLocaleString()} د.ع
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="font-semibold text-lg">المجموع الكلي:</span>
                  <span className="font-bold text-xl">{selectedOrder.total_amount.toLocaleString()} د.ع</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">ملاحظات:</h3>
                  <p className="text-muted-foreground">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Order Status */}
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm text-muted-foreground">حالة الطلب:</span>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">تاريخ الطلب:</span>
                    <p className="font-medium mt-1">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default OrdersManagement;
