import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Home } from "lucide-react";
import { Header } from "@/components/Header";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        {/* Page Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">سلة التسوق</h1>
              <Button variant="outline" onClick={() => navigate("/")}>
                <Home className="h-4 w-4 ml-2" />
                الصفحة الرئيسية
              </Button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">السلة فارغة</h2>
            <p className="text-muted-foreground mb-6">
              لم تقم بإضافة أي منتجات إلى السلة بعد
            </p>
            <Button onClick={() => navigate("/products")}>
              تصفح المنتجات
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      {/* Page Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">سلة التسوق</h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                {cartCount} {cartCount === 1 ? "منتج" : "منتجات"}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => navigate("/products")} size="sm" className="flex-1 md:flex-none">
                <ArrowRight className="h-4 w-4 ml-2" />
                متابعة التسوق
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} size="sm" className="flex-1 md:flex-none">
                <Home className="h-4 w-4 ml-2" />
                الرئيسية
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex gap-4 items-start">
                    {/* Product Image - Right Side */}
                    <div className="w-32 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                      {item.product?.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name_ar}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingCart className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    {/* Product Info - Middle */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        {item.product?.name_ar}
                      </h3>
                      <p className="text-xl font-bold text-primary mb-4">
                        {item.product?.price.toLocaleString()} د.ع
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-4 font-semibold">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart Button */}
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={isLoading}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              تفريغ السلة
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-4">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">ملخص الطلب</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-semibold">{cartTotal.toLocaleString()} د.ع</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التوصيل</span>
                    <span className="font-semibold">مجاني</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold">المجموع الكلي</span>
                      <span className="text-2xl font-bold text-primary">
                        {cartTotal.toLocaleString()} د.ع
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full mb-3"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                >
                  إتمام الطلب
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/products")}
                >
                  متابعة التسوق
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
