import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name_ar: string;
  name_en?: string;
  price: number;
  image_url?: string;
  brand_id: string;
  category_id: string;
  is_active: boolean;
  brands?: {
    name_ar: string;
  };
  categories?: {
    name_ar: string;
  };
}

interface Brand {
  id: string;
  name_ar: string;
}

interface Category {
  id: string;
  name_ar: string;
}

const ProductsNew = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Apply URL filters
    const brandParam = searchParams.get("brand");
    const categoryParam = searchParams.get("category");
    
    if (brandParam) {
      const brand = brands.find(b => b.name_ar === brandParam);
      if (brand) setSelectedBrands([brand.id]);
    }
    
    if (categoryParam) {
      const category = categories.find(c => c.name_ar === categoryParam);
      if (category) setSelectedCategories([category.id]);
    }
  }, [searchParams, brands, categories]);

  const fetchData = async () => {
    try {
      // Fetch products with brands and categories
      const { data: productsData } = await supabase
        .from("products")
        .select(`
          *,
          brands (name_ar),
          categories (name_ar)
        `)
        .eq("is_active", true);

      // Fetch brands
      const { data: brandsData } = await supabase
        .from("brands")
        .select("id, name_ar")
        .eq("is_active", true)
        .order("display_order");

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name_ar")
        .eq("is_active", true)
        .order("display_order");

      setProducts(productsData || []);
      setBrands(brandsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBrand = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setPriceRange([0, 1000000]);
    setSortBy("newest");
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      // Brand filter
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand_id)) {
        return false;
      }
      
      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category_id)) {
        return false;
      }
      
      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name":
          return a.name_ar.localeCompare(b.name_ar, "ar");
        default:
          return 0;
      }
    });

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="bg-muted/30 rounded-xl p-4">
        <Label className="text-base font-bold mb-4 block text-foreground text-right">السعر</Label>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000000}
            step={10000}
            className="mb-3"
          />
          <div className="flex justify-between text-sm font-semibold text-foreground">
            <span className="bg-primary/10 px-2 py-1 rounded-md">{priceRange[0].toLocaleString()} د.ع</span>
            <span className="bg-primary/10 px-2 py-1 rounded-md">{priceRange[1].toLocaleString()} د.ع</span>
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="bg-muted/30 rounded-xl p-4">
        <Label className="text-base font-bold mb-4 block text-foreground text-right">البراند</Label>
        <div className="space-y-2">
          {brands.map(brand => (
            <div key={brand.id} className="flex items-center justify-end space-x-2 space-x-reverse p-2 rounded-lg hover:bg-background/50 transition-colors">
              <label
                htmlFor={`brand-${brand.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {brand.name_ar}
              </label>
              <Checkbox
                id={`brand-${brand.id}`}
                checked={selectedBrands.includes(brand.id)}
                onCheckedChange={() => toggleBrand(brand.id)}
                className="h-4 w-4"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-muted/30 rounded-xl p-4">
        <Label className="text-base font-bold mb-4 block text-foreground text-right">الفئة</Label>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category.id} className="flex items-center justify-end space-x-2 space-x-reverse p-2 rounded-lg hover:bg-background/50 transition-colors">
              <label
                htmlFor={`category-${category.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category.name_ar}
              </label>
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
                className="h-4 w-4"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">جميع المنتجات</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} منتج متاح
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">الفلاتر</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile Filter & Sort */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="h-4 w-4 ml-2" />
                    الفلاتر
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[75vh] overflow-hidden">
                  <div className="px-4 py-4 overflow-y-auto flex-1">
                    <FilterContent />
                  </div>
                  <DrawerFooter className="border-t bg-background/95 backdrop-blur-sm">
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={clearFilters} className="flex-1">
                        <X className="h-4 w-4 ml-2" />
                        مسح الفلاتر
                      </Button>
                      <DrawerClose asChild>
                        <Button className="flex-1">تم</Button>
                      </DrawerClose>
                    </div>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
                  <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
                  <SelectItem value="name">الاسم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Sort */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                عرض {filteredProducts.length} من {products.length} منتج
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
                  <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
                  <SelectItem value="name">الاسم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name_ar}
                    brand={product.brands?.name_ar || ""}
                    price={product.price}
                    image={product.image_url || ""}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-4">
                  لا توجد منتجات تطابق الفلاتر المحددة
                </p>
                <Button onClick={clearFilters}>مسح الفلاتر</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductsNew;
