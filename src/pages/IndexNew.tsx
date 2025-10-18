import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ProductSection } from "@/components/ProductSection";
import { PerfumeCategoryCarousel } from "@/components/PerfumeCategoryCarousel";
import { supabase } from "@/lib/supabase";
import heroBanner from "@/assets/hero-banner.jpg";

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
  image_url?: string;
  brand_id: string;
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
        .select("*")
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
    image: brand.logo_url || heroBanner,
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
          price: product.price,
          image: product.image_url || heroBanner,
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
        <HeroSection image={heroBanner} />

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

          {/* About Section */}
          <section id="about" className="py-16 my-12 bg-muted/30 rounded-2xl">
            <div className="max-w-3xl mx-auto text-center px-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
                قصتنا
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                في عالم يزخر بالعطور، وُلد فــوح ليكون ملاذًا لكل عاشق للتميز. هنا، كل زجاجة تحمل عبق الأصالة وروح الفخامة، مختارة بعناية لتروي حكاية كل شخص يضعها.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                من نفحات الشرق العربي العريق إلى لمسات العطور العالمية النادرة، لم نكتفِ بعطر واحد، بل جمعنا نخبة البراندات الأصيلة من مختلف أنحاء العالم، لنقدم لك تنوعًا لا مثيل له. كل عطر تم انتقاؤه بعناية ليضمن الأصالة والجودة، لتختار ما يناسب شخصيتك ويعبّر عن ذوقك الفريد.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground mb-6">
                هنا، كل زيارة تصبح رحلة اكتشاف لعالم العطور، حيث يلتقي الشرق بالغرب، والفخامة بالابتكار.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                فــوح ليس مجرد متجر، بل تجربة حسية تأخذك في رحلة بين الأناقة والجاذبية، لتترك بصمتك أينما كنت.
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
