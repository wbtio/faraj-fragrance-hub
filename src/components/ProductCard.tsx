import { ShoppingCart, Heart, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface ProductCardProps {
  id?: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  onSale?: boolean;
  stockQuantity?: number;
}

export const ProductCard = ({
  id,
  name,
  brand,
  price,
  originalPrice,
  image,
  isNew,
  onSale,
  stockQuantity = 0,
}: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isRequestingNotification, setIsRequestingNotification] = useState(false);
  const [currentStock, setCurrentStock] = useState(stockQuantity);
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update stock when stockQuantity prop changes
  useEffect(() => {
    setCurrentStock(stockQuantity);
  }, [stockQuantity]);

  // Fetch current stock from database
  const fetchCurrentStock = async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setCurrentStock(data.stock_quantity || 0);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  // Calculate quantity in cart for this product
  const getQuantityInCart = () => {
    const cartItem = cartItems.find(item => item.product_id === id);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = async () => {
    if (!id) return;
    setIsAddingToCart(true);
    try {
      await addToCart(id);
      // Refresh stock after adding to cart
      await fetchCurrentStock();
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleRequestNotification = async () => {
    if (!id) return;
    
    // طلب إذن الإشعارات من المتصفح
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: "خطأ",
          description: "يرجى السماح بالإشعارات لاستخدام هذه الميزة",
          variant: "destructive",
        });
        return;
      }
    }

    setIsRequestingNotification(true);
    
    try {
      // إرسال رسالة واتساب للمدير
      const message = `مرحباً، أريد إشعار عند توفر المنتج التالي:
      
📦 المنتج: ${name}
🏷️ البراند: ${brand}

يرجى إعلامي عند توفر هذا المنتج.`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=9647842466888&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: "تم إرسال الطلب",
        description: "سيتم إعلامك عند توفر المنتج",
      });

      // حفظ طلب الإشعار في localStorage
      const notifications = JSON.parse(localStorage.getItem('productNotifications') || '[]');
      notifications.push({
        productId: id,
        productName: name,
        brand: brand,
        price: price,
        requestedAt: new Date().toISOString()
      });
      localStorage.setItem('productNotifications', JSON.stringify(notifications));

    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب",
        variant: "destructive",
      });
    } finally {
      setIsRequestingNotification(false);
    }
  };

  const handleProductClick = () => {
    if (id) {
      navigate(`/product/${id}`);
    }
  };

  // Calculate discount percentage
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Check if product is out of stock (considering items in cart)
  const quantityInCart = getQuantityInCart();
  const availableStock = currentStock - quantityInCart;
  const isOutOfStock = availableStock <= 0;

  return (
    <Card className="group overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-300 border-border">
      <div className="relative overflow-hidden bg-muted cursor-pointer" onClick={handleProductClick}>
        {/* Badges */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {!isOutOfStock && isNew && (
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              جديد
            </span>
          )}
          {!isOutOfStock && onSale && discount > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1 rounded-full">
              خصم {discount}%
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "fill-primary text-primary" : "text-foreground"
            }`}
          />
        </button>

        {/* Product Image */}
        <div className="aspect-square overflow-hidden relative bg-gray-50">
          <img
            src={image}
            alt={`${brand} ${name}`}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <CardContent className="p-4">
        {/* Brand */}
        <p className="text-xs text-muted-foreground font-medium mb-1">{brand}</p>

        {/* Product Name */}
        <h3 className="text-sm font-semibold mb-1 line-clamp-2 min-h-[2.5rem]">{name}</h3>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{price.toLocaleString()} د.ع</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-muted-foreground line-through">
                {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {discount > 0 && (
            <p className="text-xs text-destructive font-medium mt-1">
              وفّر {(originalPrice! - price).toLocaleString()} د.ع
            </p>
          )}
        </div>

        {/* Add to Cart Button */}
        {isOutOfStock ? (
          <Button 
            variant="outline" 
            className="w-full gap-2" 
            size="sm"
            onClick={handleRequestNotification}
            disabled={isRequestingNotification}
          >
            <Bell className="h-4 w-4" />
            <span>{isRequestingNotification ? "جاري الإرسال..." : "أعلمني عند التوفر"}</span>
          </Button>
        ) : (
          <Button 
            variant="luxury" 
            className="w-full gap-2" 
            size="sm"
            onClick={handleAddToCart}
            disabled={!id || isAddingToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{isAddingToCart ? "جاري الإضافة..." : "أضف للسلة"}</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
