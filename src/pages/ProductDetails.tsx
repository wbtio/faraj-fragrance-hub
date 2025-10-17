import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Heart, ArrowRight, Package, Shield, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name_ar: string;
  name_en?: string;
  description_ar?: string;
  brand_id: string;
  category_id: string;
  price: number;
  original_price?: number;
  image_url?: string;
  is_new?: boolean;
  on_sale?: boolean;
  stock_quantity?: number;
  brands?: { name_ar: string };
  categories?: { name_ar: string };
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      // Fetch product details
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(`
          *,
          brands (name_ar),
          categories (name_ar)
        `)
        .eq("id", id)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // Fetch related products from same category
      if (productData?.category_id) {
        const { data: relatedData } = await supabase
          .from("products")
          .select(`
            *,
            brands (name_ar),
            categories (name_ar)
          `)
          .eq("category_id", productData.category_id)
          .neq("id", id)
          .limit(4);

        if (relatedData) setRelatedProducts(relatedData);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل تفاصيل المنتج",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!id) return;
    setIsAddingToCart(true);
    try {
      await addToCart(id);
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة المنتج إلى السلة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إضافة المنتج إلى السلة",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "تمت الإزالة" : "تمت الإضافة",
      description: isFavorite ? "تم إزالة المنتج من المفضلة" : "تم إضافة المنتج إلى المفضلة",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">المنتج غير موجود</h2>
            <p className="text-muted-foreground mb-6">عذراً، لم نتمكن من العثور على هذا المنتج</p>
            <Button onClick={() => navigate("/products")}>
              <ArrowRight className="h-4 w-4 ml-2" />
              العودة للمنتجات
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate("/")} className="hover:text-primary">الرئيسية</button>
          <span>/</span>
          <button onClick={() => navigate("/products")} className="hover:text-primary">المنتجات</button>
          <span>/</span>
          <span className="text-foreground">{product.name_ar}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name_ar}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>
            
            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {product.is_new && (
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                  جديد
                </span>
              )}
              {product.on_sale && discount > 0 && (
                <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold">
                  خصم {discount}%
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {/* Brand */}
            {product.brands && (
              <p className="text-primary font-semibold mb-2">{product.brands.name_ar}</p>
            )}

            {/* Name */}
            <h1 className="text-3xl font-bold mb-4">{product.name_ar}</h1>

            {/* Category */}
            {product.categories && (
              <p className="text-muted-foreground mb-4">الفئة: {product.categories.name_ar}</p>
            )}

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-primary">
                {product.price.toLocaleString()} د.ع
              </span>
              {product.original_price && (
                <span className="text-2xl text-muted-foreground line-through">
                  {product.original_price.toLocaleString()} د.ع
                </span>
              )}
            </div>

            {/* Description */}
            {product.description_ar && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">الوصف</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description_ar}</p>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock_quantity && product.stock_quantity > 0 ? (
                <p className="text-green-600 font-semibold">متوفر في المخزون</p>
              ) : (
                <p className="text-destructive font-semibold">غير متوفر حالياً</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <Button
                size="lg"
                className="flex-1 gap-2"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !product.stock_quantity}
              >
                <ShoppingCart className="h-5 w-5" />
                {isAddingToCart ? "جاري الإضافة..." : "أضف للسلة"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current text-red-500" : ""}`} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">توصيل مجاني</p>
                  <p className="text-xs text-muted-foreground">للطلبات فوق 50,000 د.ع</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">ضمان الجودة</p>
                  <p className="text-xs text-muted-foreground">منتجات أصلية 100%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">إرجاع سهل</p>
                  <p className="text-xs text-muted-foreground">خلال 7 أيام</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">منتجات من نفس الفئة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  name={relatedProduct.name_ar}
                  brand={relatedProduct.brands?.name_ar || ""}
                  price={relatedProduct.price}
                  originalPrice={relatedProduct.original_price}
                  image={relatedProduct.image_url}
                  isNew={relatedProduct.is_new}
                  onSale={relatedProduct.on_sale}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
