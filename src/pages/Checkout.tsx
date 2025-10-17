import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShoppingCart, CreditCard, Truck, MapPin, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, cartTotal, clearCart } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    notes: "",
    paymentMethod: "cash_on_delivery",
  });

  // WhatsApp number in international format without spaces or plus sign
  const WHATSAPP_NUMBER = "9647842466888";

  const buildWhatsAppMessage = (orderNumber: string) => {
    const itemsText = cartItems
      .map((item) => {
        const name = item.product?.name_ar || "منتج";
        const price = item.product?.price || 0;
        const qty = item.quantity;
        const subtotal = (price * qty).toLocaleString();
        return `• ${name} | الكمية: ${qty} | الإجمالي: ${subtotal} د.ع`;
      })
      .join("\n");

    const paymentText = formData.paymentMethod === "cash_on_delivery" ? "الدفع عند الاستلام" : formData.paymentMethod;

    const message =
      `طلب جديد عبر الموقع\n` +
      `رقم الطلب: ${orderNumber}\n` +
      `\n` +
      `معلومات العميل:\n` +
      `الاسم: ${formData.fullName}\n` +
      `الهاتف: ${formData.phone}\n` +
      (formData.email ? `البريد: ${formData.email}\n` : "") +
      `\n` +
      `معلومات التوصيل:\n` +
      `المدينة: ${formData.city}\n` +
      `العنوان: ${formData.address}\n` +
      (formData.notes ? `ملاحظات: ${formData.notes}\n` : "") +
      `\n` +
      `طريقة الدفع: ${paymentText}\n` +
      `\n` +
      `المنتجات:\n${itemsText}\n` +
      `\nالمجموع الكلي: ${cartTotal.toLocaleString()} د.ع`;

    return message;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast({
        title: "السلة فارغة",
        description: "الرجاء إضافة منتجات للسلة قبل إتمام الطلب",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create customer
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .insert([{
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email || null,
          city: formData.city,
          address: formData.address,
        }])
        .select()
        .single();

      if (customerError) throw customerError;

      // 2. Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([{
          customer_id: customerData.id,
          customer_name: formData.fullName,
          customer_phone: formData.phone,
          customer_email: formData.email || null,
          customer_city: formData.city,
          customer_address: formData.address,
          total_amount: cartTotal,
          payment_method: formData.paymentMethod,
          notes: formData.notes || null,
          status: "pending",
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.product?.name_ar || "",
        product_name_ar: item.product?.name_ar || "",
        brand: "", // Will be filled from product
        price: item.product?.price || 0,
        quantity: item.quantity,
        subtotal: (item.product?.price || 0) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Send order to WhatsApp
      const message = buildWhatsAppMessage(orderData.order_number);
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");

      // 5. Clear cart
      await clearCart();

      // 6. Show success message
      toast({
        title: "تم إتمام الطلب بنجاح! 🎉",
        description: `رقم الطلب: ${orderData.order_number}`,
      });

      // 7. Redirect to success page or home
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "خطأ",
        description: "فشل إتمام الطلب. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">السلة فارغة</h2>
            <p className="text-muted-foreground mb-6">
              الرجاء إضافة منتجات للسلة قبل إتمام الطلب
            </p>
            <Button onClick={() => navigate("/products")}>
              تصفح المنتجات
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    معلومات العميل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">الاسم الكامل *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">رقم الهاتف *</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="07XXXXXXXXX"
                          className="pr-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    معلومات التوصيل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="city">المدينة *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="مثال: بغداد"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">العنوان الكامل *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="المنطقة، الشارع، رقم البناية، معلومات إضافية..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="أي ملاحظات خاصة بالطلب..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    طريقة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                  >
                    <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg">
                      <RadioGroupItem value="cash_on_delivery" id="cash" />
                      <Label htmlFor="cash" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-semibold">الدفع عند الاستلام</p>
                            <p className="text-sm text-muted-foreground">
                              ادفع نقداً عند استلام الطلب
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Products */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name_ar}</p>
                          <p className="text-muted-foreground">
                            الكمية: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {((item.product?.price || 0) * item.quantity).toLocaleString()} د.ع
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المجموع الفرعي</span>
                      <span className="font-semibold">
                        {cartTotal.toLocaleString()} د.ع
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">التوصيل</span>
                      <span className="font-semibold text-green-600">مجاني</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold">المجموع الكلي</span>
                        <span className="text-2xl font-bold text-primary">
                          {cartTotal.toLocaleString()} د.ع
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "جاري إتمام الطلب..." : "إتمام الطلب"}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>بالضغط على "إتمام الطلب" فإنك توافق على</p>
                    <p>شروط وأحكام الخدمة</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
