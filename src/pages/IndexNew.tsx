import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ProductSection } from "@/components/ProductSection";
import { PerfumeCategoryCarousel } from "@/components/PerfumeCategoryCarousel";
import { supabase } from "@/lib/supabase";

interface Brand {
  id: string;
  name_ar: string;
  description_ar?: string;
  logo_url?: string;
}

interface Product {
  id: string;
  name_ar: string;
  price: number;
  original_price?: number;
  image_url?: string;
  brand_id: string;
  stock_quantity?: number;
  is_new?: boolean;
  is_on_sale?: boolean;
}

interface HomepageSection {
  id: string;
  title: string;
  brand_id: string;
  display_order: number;
  is_active: boolean;
  product_ids: string[];
  brands?: Brand;
}

const IndexNew = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch active brands
      const { data: brandsData } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      // Fetch active homepage sections
      const { data: sectionsData } = await supabase
        .from("homepage_sections")
        .select(`
          *,
          brands!homepage_sections_brand_id_fkey (
            id,
            name_ar,
            description_ar,
            logo_url
          )
        `)
        .eq("is_active", true)
        .order("display_order");

      // Fetch all active products
      const { data: productsData } = await supabase
        .from("products")
        .select(`
          id,
          name_ar,
          price,
          original_price,
          image_url,
          brand_id,
          stock_quantity,
          is_new,
          is_on_sale
        `)
        .eq("is_active", true);

      setBrands(brandsData || []);
      setSections(sectionsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert brands to perfume categories format
  const perfumeCategories = brands.map((brand) => ({
    id: brand.id,
    title: brand.name_ar,
    description: brand.description_ar || "",
    image: brand.logo_url || "/placeholder.svg",
    items: products
      .filter((p) => p.brand_id === brand.id)
      .slice(0, 8)
      .map((p) => p.name_ar),
  }));

  // Get products for a section
  const getSectionProducts = (section: HomepageSection) => {
    return (section.product_ids || [])
      .map((productId) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return null;
        return {
          id: product.id,
          name: product.name_ar,
          brand: section.brands?.name_ar || "",
          price: product.is_on_sale && product.original_price ? product.price : product.price,
          originalPrice: product.is_on_sale && product.original_price ? product.original_price : undefined,
          image: product.image_url || "/placeholder.svg",
          isNew: product.is_new,
          onSale: product.is_on_sale,
          stockQuantity: product.stock_quantity,
        };
      })
      .filter((p) => p !== null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Perfume Categories - البراندات */}
        <section id="brands" className="py-20 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 space-y-4">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-6xl font-bold text-gradient">
                  فوح
                </h2>
                <h3 className="text-2xl md:text-3xl font-semibold text-foreground">
                  عالم العطور الاصلية
                </h3>
              </div>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                اكتشف مجموعتنا الفاخرة من العطور والبخور العربي الأصيل
              </p>
            </div>

            <PerfumeCategoryCarousel categories={perfumeCategories} />
          </div>
        </section>

        {/* Homepage Sections - الأقسام المخصصة */}
        <div className="container mx-auto px-4">
          {sections.map((section) => {
            const sectionProducts = getSectionProducts(section);
            if (sectionProducts.length === 0) return null;

            return (
              <ProductSection
                key={section.id}
                title={section.title}
                description={section.brands?.description_ar || ""}
                products={sectionProducts}
                viewMoreLink={`/products?brand=${section.brands?.name_ar}`}
              />
            );
          })}

          {/* Contact Section */}
          <section id="contact" className="py-12 my-8">
            <div className="max-w-3xl mx-auto text-center px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gradient">
                تواصل معنا
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground mb-6">
                نحن هنا لخدمتك في أي وقت. تواصل معنا عبر وسائل التواصل الاجتماعي
              </p>
              <div className="flex justify-center gap-6">
                <a
                  href="https://api.whatsapp.com/send?phone=9647842466888&text=مرحباً%20أريد%20الاستفسار%20عن%20منتجاتكم"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  واتساب
                </a>
                <a
                  href="https://www.instagram.com/3_fwh?igsh=MWF4MDlsaWpyZmg0YQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  انستغرام
                </a>
              </div>
            </div>
          </section>

          {/* Divider Line */}
          <div className="max-w-4xl mx-auto px-4">
            <div className="border-t border-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          </div>

          {/* About Section */}
          <section id="about" className="py-16 my-12">
            <div className="max-w-3xl mx-auto text-center px-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
                قصتنا
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                في عالم يزخر بالعطور، وُلد فــوح ليكون ملاذًا لكل عاشق للتميز.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                هنا، كل زجاجة تحمل عبق الأصالة وروح الفخامة، مختارة بعناية لتروي حكاية كل شخص يضعها.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                من نفحات الشرق العربي العريق إلى لمسات العطور العالمية النادرة، لم نكتفِ بعطر واحد، بل جمعنا نخبة البراندات الأصيلة من مختلف أنحاء العالم، لنقدم لك تنوعًا لا مثيل له. كل عطر تم انتقاؤه بعناية ليضمن الأصالة والجودة، لتختار ما يناسب شخصيتك ويعبّر عن ذوقك الفريد.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                فــوح ليس مجرد متجر، بل تجربة حسية تأخذك في رحلة بين الأناقة والجاذبية، لتترك بصمتك أينما كنت
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IndexNew;
