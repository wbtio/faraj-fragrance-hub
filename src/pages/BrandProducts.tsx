import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

// Mock data for brand products
const brandProductsData: Record<string, any[]> = {
  "عساف": [
    { id: "assaf-1", name: "كراون", brand: "عساف", price: 380, image: "/placeholder-perfume-1.jpg" },
    { id: "assaf-2", name: "سبيريت", brand: "عساف", price: 420, image: "/placeholder-perfume-2.jpg" },
    { id: "assaf-3", name: "فرانكل", brand: "عساف", price: 450, image: "/placeholder-perfume-3.jpg" },
    { id: "assaf-4", name: "افيتو", brand: "عساف", price: 390, image: "/placeholder-perfume-4.jpg" },
    { id: "assaf-5", name: "ساروگيت", brand: "عساف", price: 410, image: "/placeholder-perfume-5.jpg" },
    { id: "assaf-6", name: "كولت", brand: "عساف", price: 370, image: "/placeholder-perfume-6.jpg" },
    { id: "assaf-7", name: "مس فلورا", brand: "عساف", price: 430, image: "/placeholder-perfume-7.jpg" },
    { id: "assaf-8", name: "مس ساكورا", brand: "عساف", price: 440, image: "/placeholder-perfume-8.jpg" },
  ],
  "لافيرن": [
    { id: "laverne-1", name: "لافيرن كلاسيك", brand: "لافيرن", price: 320, image: "/placeholder-perfume-1.jpg" },
    { id: "laverne-2", name: "لافيرن رويال", brand: "لافيرن", price: 380, image: "/placeholder-perfume-2.jpg" },
    { id: "laverne-3", name: "لافيرن بريميوم", brand: "لافيرن", price: 420, image: "/placeholder-perfume-3.jpg" },
    { id: "laverne-4", name: "لافيرن إكسكلوسف", brand: "لافيرن", price: 450, image: "/placeholder-perfume-4.jpg" },
  ],
  "ماتش": [
    { id: "match-1", name: "ماتش كلاسيك", brand: "ماتش", price: 280, image: "/placeholder-perfume-1.jpg", onSale: true },
    { id: "match-2", name: "ماتش سبورت", brand: "ماتش", price: 300, image: "/placeholder-perfume-2.jpg", onSale: true },
    { id: "match-3", name: "ماتش نايت", brand: "ماتش", price: 320, image: "/placeholder-perfume-3.jpg" },
    { id: "match-4", name: "ماتش إنتنس", brand: "ماتش", price: 290, image: "/placeholder-perfume-4.jpg", onSale: true },
  ],
  "ريف": [
    { id: "reef-1", name: "ريف 33", brand: "ريف", price: 480, image: "/placeholder-perfume-1.jpg" },
    { id: "reef-2", name: "ريف 29", brand: "ريف", price: 460, image: "/placeholder-perfume-2.jpg" },
    { id: "reef-3", name: "ريف 21", brand: "ريف", price: 440, image: "/placeholder-perfume-3.jpg" },
    { id: "reef-4", name: "ريف 19", brand: "ريف", price: 420, image: "/placeholder-perfume-4.jpg" },
    { id: "reef-5", name: "ريف 11", brand: "ريف", price: 400, image: "/placeholder-perfume-5.jpg" },
  ],
  "ثنيان": [
    { id: "thunayan-1", name: "روشن", brand: "ثنيان", price: 520, image: "/placeholder-perfume-1.jpg" },
    { id: "thunayan-2", name: "دكتاتور", brand: "ثنيان", price: 550, image: "/placeholder-perfume-2.jpg" },
    { id: "thunayan-3", name: "ممنوع", brand: "ثنيان", price: 480, image: "/placeholder-perfume-3.jpg" },
    { id: "thunayan-4", name: "ال اوف يو", brand: "ثنيان", price: 500, image: "/placeholder-perfume-4.jpg" },
  ],
  "قصة": [
    { id: "qissa-1", name: "لالونا", brand: "قصة", price: 580, image: "/placeholder-perfume-1.jpg" },
    { id: "qissa-2", name: "ون اند اونلي", brand: "قصة", price: 620, image: "/placeholder-perfume-2.jpg" },
    { id: "qissa-3", name: "هيدسون فالي", brand: "قصة", price: 590, image: "/placeholder-perfume-3.jpg" },
    { id: "qissa-4", name: "امبيريال فالي", brand: "قصة", price: 610, image: "/placeholder-perfume-4.jpg" },
    { id: "qissa-5", name: "سافا", brand: "قصة", price: 570, image: "/placeholder-perfume-5.jpg" },
  ],
  "العز-للوود": [
    { id: "alezoud-1", name: "عود فاخر", brand: "العز للعود", price: 720, image: "/placeholder-perfume-1.jpg", isNew: true },
    { id: "alezoud-2", name: "عود ملكي", brand: "العز للعود", price: 850, image: "/placeholder-perfume-2.jpg", isNew: true },
    { id: "alezoud-3", name: "عود العز", brand: "العز للعود", price: 680, image: "/placeholder-perfume-3.jpg" },
    { id: "alezoud-4", name: "عود مميز", brand: "العز للعود", price: 750, image: "/placeholder-perfume-4.jpg" },
  ],
  "دخون": [
    { id: "dukhoon-1", name: "اميرالد عود", brand: "دخون", price: 380, image: "/placeholder-perfume-1.jpg" },
    { id: "dukhoon-2", name: "برايم", brand: "دخون", price: 420, image: "/placeholder-perfume-2.jpg" },
    { id: "dukhoon-3", name: "ماكس", brand: "دخون", price: 360, image: "/placeholder-perfume-3.jpg" },
    { id: "dukhoon-4", name: "ذاتي", brand: "دخون", price: 400, image: "/placeholder-perfume-4.jpg" },
    { id: "dukhoon-5", name: "دخون ليذر", brand: "دخون", price: 430, image: "/placeholder-perfume-5.jpg" },
  ],
};

const BrandProducts = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [brandName, setBrandName] = useState<string>("");

  useEffect(() => {
    // Convert slug back to brand name
    let brandNameFromSlug = brandSlug || "";
    
    // Handle special case for العز للعود
    if (brandSlug === "العز-للوود") {
      brandNameFromSlug = "العز للعود";
    }
    
    setBrandName(brandNameFromSlug);
    
    // Get products for this brand
    const brandProducts = brandProductsData[brandSlug || ""] || [];
    setProducts(brandProducts);
  }, [brandSlug]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{brandName}</h1>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد منتجات متاحة لهذا البراند حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandProducts;