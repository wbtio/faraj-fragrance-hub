import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  isNew?: boolean;
  onSale?: boolean;
  stockQuantity?: number;
}

interface ProductSectionProps {
  title: string;
  description?: string;
  products: Product[];
  viewMoreLink?: string;
}

export const ProductSection = ({
  title,
  description,
  products,
  viewMoreLink = "#",
}: ProductSectionProps) => {
  const navigate = useNavigate();

  const handleViewMore = () => {
    if (viewMoreLink && viewMoreLink !== "#") {
      navigate(viewMoreLink);
    } else {
      // Default behavior - you can customize this based on the brand
      const brandSlug = title.toLowerCase().replace(/\s+/g, '-');
      navigate(`/brand/${brandSlug}`);
    }
  };

  return (
    <section className="py-12">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
        {description && (
          <p className="text-muted-foreground max-w-3xl mx-auto">{description}</p>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* View More Button */}
      <div className="flex justify-center mt-8">
        <Button variant="outline" className="gap-2" onClick={handleViewMore}>
          <span>عرض المزيد</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
};