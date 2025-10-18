import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search as SearchIcon, X, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name_ar: string;
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

interface Brand {
  id: string;
  name_ar: string;
}

interface Category {
  id: string;
  name_ar: string;
}

const Search = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [priceRange, setPriceRange] = useState<string>("all");

  // Fetch brands and categories
  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedBrand, selectedCategory, sortBy, priceRange]);

  const fetchBrands = async () => {
    const { data } = await supabase
      .from("brands")
      .select("id, name_ar")
      .order("name_ar");
    if (data) setBrands(data);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name_ar")
      .order("name_ar");
    if (data) setCategories(data);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          brands!products_brand_id_fkey (name_ar),
          categories!products_category_id_fkey (name_ar)
        `);

      // Search filter
      if (searchQuery) {
        query = query.ilike('name_ar', `%${searchQuery}%`);
      }

      // Brand filter
      if (selectedBrand !== "all") {
        query = query.eq("brand_id", selectedBrand);
      }

      // Category filter
      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      // Price range filter
      if (priceRange !== "all") {
        switch (priceRange) {
          case "under-50k":
            query = query.lt("price", 50000);
            break;
          case "50k-100k":
            query = query.gte("price", 50000).lte("price", 100000);
            break;
          case "100k-200k":
            query = query.gte("price", 100000).lte("price", 200000);
            break;
          case "over-200k":
            query = query.gt("price", 200000);
            break;
        }
      }

      // Sorting
      switch (sortBy) {
        case "price-low":
          query = query.order("price", { ascending: true });
          break;
        case "price-high":
          query = query.order("price", { ascending: false });
          break;
        case "name":
          query = query.order("name_ar", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBrand("all");
    setSelectedCategory("all");
    setSortBy("newest");
    setPriceRange("all");
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      {/* Search Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-12">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="ابحث عن العطور، البراندات، أو الفئات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 text-lg pr-14 pl-4"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 top-2 h-10 w-10"
                >
                  <SearchIcon className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Filter Toggle Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-14 gap-2 px-4"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">{showFilters ? "إخفاء" : "فلاتر"}</span>
              </Button>
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="max-w-5xl mx-auto bg-card p-6 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Brand Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">البراند</label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع البراندات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع البراندات</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">الفئة</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الفئات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الفئات</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">نطاق السعر</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="جميع الأسعار" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأسعار</SelectItem>
                      <SelectItem value="under-50k">أقل من 50,000 د.ع</SelectItem>
                      <SelectItem value="50k-100k">50,000 - 100,000 د.ع</SelectItem>
                      <SelectItem value="100k-200k">100,000 - 200,000 د.ع</SelectItem>
                      <SelectItem value="over-200k">أكثر من 200,000 د.ع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">الترتيب</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="الأحدث" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">الأحدث</SelectItem>
                      <SelectItem value="price-low">السعر: من الأقل للأعلى</SelectItem>
                      <SelectItem value="price-high">السعر: من الأعلى للأقل</SelectItem>
                      <SelectItem value="name">الاسم: أ - ي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full gap-2"
              >
                <X className="h-4 w-4" />
                مسح جميع الفلاتر
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-12">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {isLoading ? (
              "جاري البحث..."
            ) : (
              <>
                تم العثور على <span className="font-bold text-foreground">{products.length}</span> منتج
                {searchQuery && (
                  <span> لـ "<span className="font-bold text-primary">{searchQuery}</span>"</span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name_ar}
                brand={product.brands?.name_ar || ""}
                price={product.price}
                originalPrice={product.original_price}
                image={product.image_url}
                isNew={product.is_new}
                onSale={product.on_sale}
                stockQuantity={product.stock_quantity}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">لم يتم العثور على نتائج</h3>
            <p className="text-muted-foreground mb-6">
              جرب تغيير كلمات البحث أو الفلاتر
            </p>
            <Button onClick={clearFilters}>مسح الفلاتر</Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Search;
