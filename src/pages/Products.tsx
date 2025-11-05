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
import { supabase } from "@/lib/supabase";
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
interface Product {
  id: string;
  name_ar: string;
  price: number;
  original_price?: number;
  image_url?: string;
  is_new?: boolean;
  on_sale?: boolean;
  stock_quantity?: number;
  volume?: string;
  brand_id: string;
  category_id: string;
  brands?: { name_ar: string; slug: string };
  categories?: { name_ar: string; slug: string };
}

interface Brand {
  id: string;
  name_ar: string;
  slug: string;
}

interface Category {
  id: string;
  name_ar: string;
  slug: string;
}

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [pageTitle, setPageTitle] = useState<string>("جميع المنتجات");
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>("default");

  const categoryName = searchParams.get("category");
  const brandName = searchParams.get("brand");

  // Fetch data from database
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-select filters based on URL parameters
  useEffect(() => {
    if (brandName && allBrands.length > 0) {
      const brand = allBrands.find(b => b.name_ar === brandName);
      if (brand && !selectedBrands.includes(brand.id)) {
        setSelectedBrands([brand.id]);
      }
    }
    
    if (categoryName && allCategories.length > 0 && categoryName !== "new" && categoryName !== "offers") {
      const category = allCategories.find(c => c.name_ar === categoryName);
      if (category && !selectedCategories.includes(category.id)) {
        setSelectedCategories([category.id]);
      }
    }
  }, [brandName, categoryName, allBrands, allCategories]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          *,
          brands!products_brand_id_fkey (name_ar, slug),
          categories!products_category_id_fkey (name_ar, slug)
        `)
        .eq("is_active", true);

      if (productsError) throw productsError;
      setAllProducts(productsData || []);

      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase
        .from("brands")
        .select("id, name_ar, slug")
        .eq("is_active", true)
        .order("display_order");

      if (brandsError) throw brandsError;
      setAllBrands(brandsData || []);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name_ar, slug")
        .eq("is_active", true)
        .order("display_order");

      if (categoriesError) throw categoriesError;
      setAllCategories(categoriesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (allProducts.length === 0) return;
    
    let products = [...allProducts];

    // Filter by URL params first (using Arabic names)
    if (categoryName) {
      if (categoryName === "new") {
        products = products.filter(p => p.is_new);
        setPageTitle("أحدث العطور");
      } else if (categoryName === "offers") {
        products = products.filter(p => p.on_sale);
        setPageTitle("العروض الخاصة");
      } else {
        products = products.filter(p => p.categories?.name_ar === categoryName);
        setPageTitle(categoryName);
      }
    }

    if (brandName) {
      products = products.filter(p => p.brands?.name_ar === brandName);
      setPageTitle(brandName);
    }

    // Apply selected brands filter (using IDs)
    if (selectedBrands.length > 0) {
      products = products.filter(p => p.brand_id && selectedBrands.includes(p.brand_id));
    }

    // Apply selected categories filter (using IDs)
    if (selectedCategories.length > 0) {
      products = products.filter(p => p.category_id && selectedCategories.includes(p.category_id));
    }

    // Apply price range filter
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Apply sorting
    if (sortBy === "price-asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      products.sort((a, b) => a.name_ar.localeCompare(b.name_ar, 'ar'));
    }

    setFilteredProducts(products);
  }, [allProducts, categoryName, brandName, selectedBrands, selectedCategories, priceRange, sortBy, allCategories, allBrands]);

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
            <div key={cat.id} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => handleCategoryToggle(cat.id)}
              />
              <label
                htmlFor={`cat-${cat.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {cat.name_ar}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">البراندات</Label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allBrands.map((brand) => (
            <div key={brand.id} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={`brand-${brand.id}`}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={() => handleBrandToggle(brand.id)}
              />
              <label
                htmlFor={`brand-${brand.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {brand.name_ar}
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
                  <ProductCard 
                    key={product.id}
                    id={product.id}
                    name={product.name_ar}
                    brand={product.brands?.name_ar || ""}
                    price={product.price}
                    originalPrice={product.original_price}
                    image={product.image_url || ""}
                    isNew={product.is_new}
                    onSale={product.on_sale}
                    stockQuantity={product.stock_quantity}
                    volume={product.volume}
                  />
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
