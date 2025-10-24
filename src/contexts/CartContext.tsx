import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name_ar: string;
  price: number;
  image_url?: string;
  brand_id: string;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");

  // Get or create session ID
  useEffect(() => {
    let sid = localStorage.getItem("cart_session_id");
    if (!sid) {
      sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("cart_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  // Fetch cart items
  useEffect(() => {
    if (sessionId) {
      fetchCart();
    }
  }, [sessionId]);

  const fetchCart = async () => {
    try {
      const { data: cartData, error } = await supabase
        .from("cart")
        .select(`
          id,
          product_id,
          quantity,
          products (
            id,
            name_ar,
            price,
            image_url,
            brand_id
          )
        `)
        .eq("session_id", sessionId);

      if (error) throw error;

      const items = cartData?.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.products,
      })) || [];

      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const addToCart = async (productId: string) => {
    setIsLoading(true);
    try {
      // Get product stock quantity
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      const availableStock = productData?.stock_quantity || 0;

      // Check if product already in cart
      const existingItem = cartItems.find(item => item.product_id === productId);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;

      // Check if adding one more would exceed stock
      if (currentCartQuantity + 1 > availableStock) {
        toast({
          title: "الكمية غير متوفرة",
          description: `عذراً، الكمية المتوفرة في المخزون: ${availableStock} فقط`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart")
          .update({ 
            quantity: existingItem.quantity + 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from("cart")
          .insert([{
            session_id: sessionId,
            product_id: productId,
            quantity: 1,
          }]);

        if (error) throw error;
      }

      await fetchCart();

      toast({
        title: "تمت الإضافة",
        description: "تم إضافة المنتج إلى السلة",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "خطأ",
        description: "فشل إضافة المنتج إلى السلة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("cart")
        .delete()
        .eq("id", cartItemId);

      if (error) throw error;

      await fetchCart();

      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج من السلة",
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "خطأ",
        description: "فشل حذف المنتج",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(cartItemId);
      return;
    }

    setIsLoading(true);
    try {
      // Get the cart item to find product_id
      const cartItem = cartItems.find(item => item.id === cartItemId);
      if (!cartItem) {
        throw new Error("Cart item not found");
      }

      // Get product stock quantity
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", cartItem.product_id)
        .single();

      if (productError) throw productError;

      const availableStock = productData?.stock_quantity || 0;

      // Check if requested quantity exceeds stock
      if (quantity > availableStock) {
        toast({
          title: "الكمية غير متوفرة",
          description: `عذراً، الكمية المتوفرة في المخزون: ${availableStock} فقط`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase
        .from("cart")
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq("id", cartItemId);

      if (error) throw error;

      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "خطأ",
        description: "فشل تحديث الكمية",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("cart")
        .delete()
        .eq("session_id", sessionId);

      if (error) throw error;

      setCartItems([]);

      toast({
        title: "تم التفريغ",
        description: "تم تفريغ السلة بنجاح",
      });
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "خطأ",
        description: "فشل تفريغ السلة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
