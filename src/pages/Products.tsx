import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, SlidersHorizontal, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import perfume1 from "@/assets/perfume-1.jpg";
import perfume2 from "@/assets/perfume-2.jpg";
import perfume3 from "@/assets/perfume-3.jpg";
import perfume4 from "@/assets/perfume-4.jpg";
import perfume5 from "@/assets/perfume-5.jpg";
import perfume6 from "@/assets/perfume-6.jpg";
import perfume7 from "@/assets/perfume-7.jpg";
import perfume8 from "@/assets/perfume-8.jpg";

// Mock data - في المستقبل سيتم جلبها من قاعدة البيانات
const allProducts = [
  // عساف
  { id: "assaf-1", name: "كراون", brand: "عساف", price: 380, image: perfume1, category: "men", gender: "رجالي" },
  { id: "assaf-2", name: "سبيريت", brand: "عساف", price: 420, image: perfume2, category: "men", gender: "رجالي" },
  { id: "assaf-3", name: "فرانكل", brand: "عساف", price: 450, image: perfume3, category: "unisex", gender: "للجنسين" },
  { id: "assaf-4", name: "افيتو", brand: "عساف", price: 390, image: perfume4, category: "men", gender: "رجالي" },
  { id: "assaf-5", name: "ساروگيت", brand: "عساف", price: 410, image: perfume5, category: "women", gender: "نسائي" },
  { id: "assaf-6", name: "كولت", brand: "عساف", price: 370, image: perfume6, category: "men", gender: "رجالي" },
  { id: "assaf-7", name: "مس فلورا", brand: "عساف", price: 430, image: perfume7, category: "women", gender: "نسائي" },
  { id: "assaf-8", name: "مس ساكورا", brand: "عساف", price: 440, image: perfume8, category: "women", gender: "نسائي" },
  
  // لافيرن
  { id: "laverne-1", name: "لافيرن كلاسيك", brand: "لافيرن", price: 320, image: perfume1, category: "unisex", gender: "للجنسين" },
  { id: "laverne-2", name: "لافيرن رويال", brand: "لافيرن", price: 380, image: perfume2, category: "men", gender: "رجالي" },
  { id: "laverne-3", name: "لافيرن بريميوم", brand: "لافيرن", price: 420, image: perfume3, category: "women", gender: "نسائي" },
  { id: "laverne-4", name: "لافيرن إكسكلوسف", brand: "لافيرن", price: 450, image: perfume4, category: "unisex", gender: "للجنسين" },
  
  // ماتش
  { id: "match-1", name: "ماتش كلاسيك", brand: "ماتش", price: 280, image: perfume5, category: "men", gender: "رجالي", onSale: true },
  { id: "match-2", name: "ماتش سبورت", brand: "ماتش", price: 300, image: perfume6, category: "men", gender: "رجالي", onSale: true },
  { id: "match-3", name: "ماتش نايت", brand: "ماتش", price: 320, image: perfume7, category: "men", gender: "رجالي" },
  { id: "match-4", name: "ماتش إنتنس", brand: "ماتش", price: 290, image: perfume8, category: "unisex", gender: "للجنسين", onSale: true },
  
  // ريف
  { id: "reef-1", name: "ريف 33", brand: "ريف", price: 480, image: perfume1, category: "men", gender: "رجالي" },
  { id: "reef-2", name: "ريف 29", brand: "ريف", price: 460, image: perfume2, category: "women", gender: "نسائي" },
  { id: "reef-3", name: "ريف 21", brand: "ريف", price: 440, image: perfume3, category: "unisex", gender: "للجنسين" },
  { id: "reef-4", name: "ريف 19", brand: "ريف", price: 420, image: perfume4, category: "men", gender: "رجالي" },
  { id: "reef-5", name: "ريف 11", brand: "ريف", price: 400, image: perfume5, category: "women", gender: "نسائي" },
  
  // ثنيان
  { id: "thunayan-1", name: "روشن", brand: "ثنيان", price: 520, image: perfume6, category: "men", gender: "رجالي" },
  { id: "thunayan-2", name: "دكتاتور", brand: "ثنيان", price: 550, image: perfume7, category: "men", gender: "رجالي" },
  { id: "thunayan-3", name: "ممنوع", brand: "ثنيان", price: 480, image: perfume8, category: "men", gender: "رجالي" },
  { id: "thunayan-4", name: "ال اوف يو", brand: "ثنيان", price: 500, image: perfume1, category: "men", gender: "رجالي" },
  
  // قصة
  { id: "qissa-1", name: "لالونا", brand: "قصة", price: 580, image: perfume2, category: "women", gender: "نسائي" },
  { id: "qissa-2", name: "ون اند اونلي", brand: "قصة", price: 620, image: perfume3, category: "unisex", gender: "للجنسين" },
  { id: "qissa-3", name: "هيدسون فالي", brand: "قصة", price: 590, image: perfume4, category: "men", gender: "رجالي" },
  { id: "qissa-4", name: "امبيريال فالي", brand: "قصة", price: 610, image: perfume5, category: "women", gender: "نسائي" },
  { id: "qissa-5", name: "سافا", brand: "قصة", price: 570, image: perfume6, category: "women", gender: "نسائي" },
  
  // العز للعود
  { id: "alezoud-1", name: "عود فاخر", brand: "العز للعود", price: 720, image: perfume7, category: "unisex", gender: "للجنسين", isNew: true },
  { id: "alezoud-2", name: "عود ملكي", brand: "العز للعود", price: 850, image: perfume8, category: "unisex", gender: "للجنسين", isNew: true },
  { id: "alezoud-3", name: "عود العز", brand: "العز للعود", price: 680, image: perfume1, category: "men", gender: "رجالي" },
  { id: "alezoud-4", name: "عود مميز", brand: "العز للعود", price: 750, image: perfume2, category: "women", gender: "نسائي" },
  
  // دخون
  { id: "dukhoon-1", name: "اميرالد عود", brand: "دخون", price: 380, image: perfume3, category: "unisex", gender: "للجنسين" },
  { id: "dukhoon-2", name: "برايم", brand: "دخون", price: 420, image: perfume4, category: "men", gender: "رجالي" },
  { id: "dukhoon-3", name: "ماكس", brand: "دخون", price: 360, image: perfume5, category: "unisex", gender: "للجنسين" },
  { id: "dukhoon-4", name: "ذاتي", brand: "دخون", price: 400, image: perfume6, category: "women", gender: "نسائي" },
  { id: "dukhoon-5", name: "دخون ليذر", brand: "دخون", price: 430, image: perfume7, category: "men", gender: "رجالي" },
  
  // ابراق
  { id: "abraq-1", name: "ابراق الأصيل", brand: "ابراق", price: 350, image: perfume8, category: "men", gender: "رجالي" },
  { id: "abraq-2", name: "ابراق الفاخر", brand: "ابراق", price: 380, image: perfume1, category: "unisex", gender: "للجنسين" },
  { id: "abraq-3", name: "ابراق المميز", brand: "ابراق", price: 360, image: perfume2, category: "women", gender: "نسائي" },
];

const categoryNames: Record<string, string> = {
  men: "عطور رجالية",
  women: "عطور نسائية",
  unisex: "عطور للجنسين",
  hair: "عطور الشعر",
  new: "أحدث العطور",
  offers: "العروض الخاصة",
};

const allBrands = ["عساف", "لافيرن", "ماتش", "ريف", "ثنيان", "قصة", "العز للعود", "دخون", "ابراق"];
const allCategories = [
  { value: "men", label: "عطور رجالية" },
  { value: "women", label: "عطور نسائية" },
  { value: "unisex", label: "عطور للجنسين" },
  { value: "hair", label: "عطور الشعر" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [pageTitle, setPageTitle] = useState<string>("جميع المنتجات");
  
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>("default");

  const category = searchParams.get("category");
  const brand = searchParams.get("brand");

  useEffect(() => {
    // Initialize filters from URL params
    if (brand && !selectedBrands.includes(brand)) {
      setSelectedBrands([brand]);
    }
    if (category && !selectedCategories.includes(category)) {
      setSelectedCategories([category]);
    }
  }, []);

  useEffect(() => {
    let products = [...allProducts];

    // Filter by URL params first
    if (category) {
      if (category === "new") {
        products = products.filter(p => p.isNew);
        setPageTitle("أحدث العطور");
      } else if (category === "offers") {
        products = products.filter(p => p.onSale);
        setPageTitle("العروض الخاصة");
      } else {
        products = products.filter(p => p.category === category);
        setPageTitle(categoryNames[category] || "المنتجات");
      }
    }

    if (brand) {
      products = products.filter(p => p.brand === brand);
      setPageTitle(brand);
    }

    // Apply selected brands filter
    if (selectedBrands.length > 0) {
      products = products.filter(p => selectedBrands.includes(p.brand));
    }

    // Apply selected categories filter
    if (selectedCategories.length > 0) {
      products = products.filter(p => selectedCategories.includes(p.category));
    }

    // Apply price range filter
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Apply sorting
    if (sortBy === "price-asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      products.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }

    setFilteredProducts(products);
  }, [category, brand, selectedBrands, selectedCategories, priceRange, sortBy]);

  const handleBrandToggle = (brandName: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandName)
        ? prev.filter(b => b !== brandName)
        : [...prev, brandName]
    );
  };

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat)
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceRange([0, 1000]);
    setSortBy("default");
  };

  const handleBack = () => {
    navigate("/");
  };

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">نطاق السعر</Label>
        <div className="space-y-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{priceRange[0]} د.ع</span>
            <span>{priceRange[1]} د.ع</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">الفئات</Label>
        <div className="space-y-2">
          {allCategories.map((cat) => (
            <div key={cat.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`cat-${cat.value}`}
                checked={selectedCategories.includes(cat.value)}
                onCheckedChange={() => handleCategoryToggle(cat.value)}
              />
              <label
                htmlFor={`cat-${cat.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {cat.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">البراندات</Label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allBrands.map((brandName) => (
            <div key={brandName} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`brand-${brandName}`}
                checked={selectedBrands.includes(brandName)}
                onCheckedChange={() => handleBrandToggle(brandName)}
              />
              <label
                htmlFor={`brand-${brandName}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {brandName}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="h-4 w-4 ml-2" />
        مسح الفلاتر
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handleBack}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{pageTitle}</h1>
              <p className="text-muted-foreground mt-1">
                {filteredProducts.length} منتج
              </p>
            </div>
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="ترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">الافتراضي</SelectItem>
                <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
                <SelectItem value="name">الاسم</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>الفلاتر</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSection />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">الفلاتر</h2>
              <FilterSection />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد منتجات تطابق الفلاتر المحددة</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  مسح الفلاتر
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;
