import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationRequest {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  price: number;
  customerPhone?: string;
  customerName?: string;
  requestedAt: string;
  status: 'pending' | 'notified' | 'cancelled';
}

const NotificationRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<NotificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching notification requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (id: string, status: 'notified' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('notification_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setRequests(requests.map(req => 
        req.id === id ? { ...req, status } : req
      ));

      toast({
        title: "تم التحديث",
        description: `تم تحديث حالة الطلب إلى ${status === 'notified' ? 'تم الإشعار' : 'ملغي'}`,
      });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "خطأ",
        description: "فشل تحديث حالة الطلب",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">في الانتظار</Badge>;
      case 'notified':
        return <Badge variant="default" className="bg-green-500">تم الإشعار</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">ملغي</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">طلبات الإشعارات</h1>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {requests.length} طلب
          </Badge>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد طلبات إشعارات</h3>
              <p className="text-muted-foreground">
                لم يتم طلب إشعارات للمنتجات النافدة بعد
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.productName}</CardTitle>
                      <p className="text-muted-foreground">{request.brand}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">السعر</p>
                      <p className="font-semibold">{request.price.toLocaleString()} د.ع</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                      <p className="font-semibold">
                        {new Date(request.requestedAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">وقت الطلب</p>
                      <p className="font-semibold">
                        {new Date(request.requestedAt).toLocaleTimeString('ar-SA')}
                      </p>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateRequestStatus(request.id, 'notified')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4 ml-1" />
                        تم الإشعار
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRequestStatus(request.id, 'cancelled')}
                      >
                        <XCircle className="h-4 w-4 ml-1" />
                        إلغاء
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationRequests;
