import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id?: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  onSale?: boolean;
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
}: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!id) return;
    setIsAddingToCart(true);
    try {
      await addToCart(id);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleProductClick = () => {
    if (id) {
      navigate(`/product/${id}`);
    }
  };

  return (
    <Card className="group overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-300 border-border">
      <div className="relative overflow-hidden bg-muted cursor-pointer" onClick={handleProductClick}>
        {/* Badges */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          {isNew && (
            <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              جديد
            </span>
          )}
          {onSale && (
            <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1 rounded-full">
              خصم
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
        <div className="aspect-square overflow-hidden">
          <img
            src={image}
            alt={`${brand} ${name}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </div>

      <CardContent className="p-4">
        {/* Brand */}
        <p className="text-xs text-muted-foreground font-medium mb-1">{brand}</p>

        {/* Product Name */}
        <h3 className="text-sm font-semibold mb-2 line-clamp-2 min-h-[2.5rem]">{name}</h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">{price.toLocaleString()} د.ع</span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice.toLocaleString()} د.ع
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
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
      </CardContent>
    </Card>
  );
};
