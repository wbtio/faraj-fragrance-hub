import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/HeroSection";
import { ProductSection } from "@/components/ProductSection";
import { PerfumeCategoryCarousel } from "@/components/PerfumeCategoryCarousel";
import heroBanner from "@/assets/hero-banner.jpg";
import perfume1 from "@/assets/perfume-1.jpg";
import perfume2 from "@/assets/perfume-2.jpg";
import perfume3 from "@/assets/perfume-3.jpg";
import perfume4 from "@/assets/perfume-4.jpg";
import perfume5 from "@/assets/perfume-5.jpg";
import perfume6 from "@/assets/perfume-6.jpg";
import perfume7 from "@/assets/perfume-7.jpg";
import perfume8 from "@/assets/perfume-8.jpg";
import categoryAssaf from "@/assets/category-assaf.jpg";
import categoryReef from "@/assets/category-reef.jpg";
import categoryQissa from "@/assets/category-qissa.jpg";
import categoryThunayan from "@/assets/category-thunayan.jpg";
import categoryDukhoon from "@/assets/category-dukhoon.jpg";
import categoryAlezoud from "@/assets/category-alezoud.jpg";
import categoryLaverne from "@/assets/category-laverne.jpg";
import categoryAbraq from "@/assets/category-abraq.jpg";
import categoryMatch from "@/assets/category-match.jpg";
import categoryNiche from "@/assets/category-niche.jpg";
const Index = () => {
  const perfumeCategories = [{
    id: "assaf",
    title: "عساف",
    description: "تشكيلة فاخرة من أرقى العطور العالمية بلمسة عربية أصيلة",
    image: categoryAssaf,
    items: ["كراون", "سبيريت", "فرانكل", "افيتو", "ساروگيت", "كولت", "مس فلورا", "مس ساكورا"]
  }, {
    id: "reef",
    title: "ريف",
    description: "عطور مميزة بتركيبات فريدة تناسب جميع الأوقات",
    image: categoryReef,
    items: ["ريف 33", "ريف 29", "ريف 21", "ريف 19", "ريف 11"]
  }, {
    id: "qissa",
    title: "قصة",
    description: "روائح آسرة تحكي قصة من الفخامة والأناقة",
    image: categoryQissa,
    items: ["لالونا", "ون اند اونلي", "هيدسون فالي", "امبيريال فالي", "سافا"]
  }, {
    id: "thunayan",
    title: "ثنيان",
    description: "عطور رجالية قوية تعكس الشخصية المميزة",
    image: categoryThunayan,
    items: ["روشن", "دكتاتور", "ممنوع", "ال اوف يو"]
  }, {
    id: "dukhoon",
    title: "دخون",
    description: "بخور عربي أصيل بروائح تقليدية فاخرة",
    image: categoryDukhoon,
    items: ["اميرالد عود", "برايم", "ماكس", "ذاتي", "دخون ليذر"]
  }, {
    id: "alezoud",
    title: "العز للعود",
    description: "عود فاخر بجودة استثنائية من أجود أنواع العود",
    image: categoryAlezoud,
    items: ["عود فاخر", "عود ملكي", "عود العز", "عود مميز"]
  }, {
    id: "laverne",
    title: "لافيرن",
    description: "عطور عصرية بلمسة من الكلاسيكية الفرنسية",
    image: categoryLaverne,
    items: ["لافيرن كلاسيك", "لافيرن رويال", "لافيرن بريميوم"]
  }, {
    id: "abraq",
    title: "ابراق",
    description: "تركيبات عطرية مبتكرة تجمع بين الأصالة والحداثة",
    image: categoryAbraq,
    items: ["ابراق الأصيل", "ابراق الفاخر", "ابراق المميز"]
  }, {
    id: "match",
    title: "ماتش",
    description: "عطور رياضية منعشة للحياة العصرية النشطة",
    image: categoryMatch,
    items: ["ماتش كلاسيك", "ماتش سبورت", "ماتش نايت"]
  }, {
    id: "niche",
    title: "عطور النيش الفاخرة",
    description: "تشكيلة حصرية من أشهر بيوت العطور العالمية",
    image: categoryNiche,
    items: ["زيرجوف", "ديور", "نارسيسو", "دولجي گابانا", "صمام"]
  }];
  const newArrivals = [{
    id: "1",
    name: "سوفاج",
    brand: "ديور",
    price: 450,
    image: perfume1,
    isNew: true
  }, {
    id: "2",
    name: "كوكو مادموزيل",
    brand: "شانيل",
    price: 520,
    image: perfume2,
    isNew: true
  }, {
    id: "3",
    name: "بلاك أوركيد",
    brand: "توم فورد",
    price: 680,
    image: perfume3,
    isNew: true
  }, {
    id: "4",
    name: "بلوم",
    brand: "غوتشي",
    price: 420,
    image: perfume4,
    isNew: true
  }];
  const mensPerfumes = [{
    id: "5",
    name: "Y",
    brand: "إيف سان لوران",
    price: 480,
    image: perfume5
  }, {
    id: "6",
    name: "إيروس",
    brand: "فيرساتشي",
    price: 390,
    originalPrice: 450,
    image: perfume6,
    onSale: true
  }, {
    id: "1",
    name: "سوفاج",
    brand: "ديور",
    price: 450,
    image: perfume1
  }, {
    id: "3",
    name: "بلاك أوركيد",
    brand: "توم فورد",
    price: 680,
    image: perfume3
  }];
  const womensPerfumes = [{
    id: "2",
    name: "كوكو مادموزيل",
    brand: "شانيل",
    price: 520,
    image: perfume2
  }, {
    id: "4",
    name: "بلوم",
    brand: "غوتشي",
    price: 420,
    image: perfume4
  }, {
    id: "7",
    name: "سي",
    brand: "جورجيو أرماني",
    price: 550,
    image: perfume7
  }, {
    id: "8",
    name: "لونا روزا",
    brand: "برادا",
    price: 480,
    originalPrice: 550,
    image: perfume8,
    onSale: true
  }];
  const specialOffers = [{
    id: "6",
    name: "إيروس",
    brand: "فيرساتشي",
    price: 390,
    originalPrice: 450,
    image: perfume6,
    onSale: true
  }, {
    id: "8",
    name: "لونا روزا",
    brand: "برادا",
    price: 480,
    originalPrice: 550,
    image: perfume8,
    onSale: true
  }, {
    id: "2",
    name: "كوكو مادموزيل",
    brand: "شانيل",
    price: 520,
    image: perfume2,
    onSale: true
  }, {
    id: "4",
    name: "بلوم",
    brand: "غوتشي",
    price: 420,
    image: perfume4,
    onSale: true
  }];
  return <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main>
        {/* Hero Section */}
        <HeroSection image={heroBanner} />

        {/* Perfume Categories */}
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

        <div className="container mx-auto px-4">
          {/* عساف */}
          <ProductSection
            title="عساف"
            description="إما العظمة، او لا شيء توقيع عربي يحمل عبق التراث وأناقة الحاضر"
            products={[
              { id: "assaf-1", name: "كراون", brand: "عساف", price: 380, image: perfume1 },
              { id: "assaf-2", name: "سبيريت", brand: "عساف", price: 420, image: perfume2 },
              { id: "assaf-3", name: "فرانكل", brand: "عساف", price: 450, image: perfume3 },
              { id: "assaf-4", name: "افيتو", brand: "عساف", price: 390, image: perfume4 },
            ]}
            viewMoreLink="/products?brand=عساف"
          />

          {/* لافيرن */}
          <ProductSection
            title="لافيرن"
            description="رحلة في الطبيعة عطور تُلهم الحواس وتترك أثراً لا يُنسى"
            products={[
              { id: "laverne-1", name: "لافيرن كلاسيك", brand: "لافيرن", price: 320, image: perfume5 },
              { id: "laverne-2", name: "لافيرن رويال", brand: "لافيرن", price: 380, image: perfume6 },
              { id: "laverne-3", name: "لافيرن بريميوم", brand: "لافيرن", price: 420, image: perfume7 },
              { id: "laverne-4", name: "لافيرن إكسكلوسف", brand: "لافيرن", price: 450, image: perfume8 },
            ]}
            viewMoreLink="/products?brand=لافيرن"
          />

          {/* ماتش */}
          <ProductSection
            title="ماتش"
            description="الطيب الأصلي بالسعر الأصلي لأن الفخامة ما لازم تكون غالية"
            products={[
              { id: "match-1", name: "ماتش كلاسيك", brand: "ماتش", price: 280, image: perfume1, onSale: true },
              { id: "match-2", name: "ماتش سبورت", brand: "ماتش", price: 300, image: perfume2, onSale: true },
              { id: "match-3", name: "ماتش نايت", brand: "ماتش", price: 320, image: perfume3 },
              { id: "match-4", name: "ماتش إنتنس", brand: "ماتش", price: 290, image: perfume4, onSale: true },
            ]}
            viewMoreLink="/products?brand=ماتش"
          />

          {/* ريف */}
          <ProductSection
            title="ريف"
            description="حضورك أرقى مع كل رشة من ريف عطور تجمع بين الأصالة والحداثة لتقدم لك تجارب عطرية تفوق توقعاتك"
            products={[
              { id: "reef-1", name: "ريف 33", brand: "ريف", price: 480, image: perfume5 },
              { id: "reef-2", name: "ريف 29", brand: "ريف", price: 460, image: perfume6 },
              { id: "reef-3", name: "ريف 21", brand: "ريف", price: 440, image: perfume7 },
              { id: "reef-4", name: "ريف 19", brand: "ريف", price: 420, image: perfume8 },
            ]}
            viewMoreLink="/products?brand=ريف"
          />

          {/* ثنيان */}
          <ProductSection
            title="ثنيان"
            description="ملكي الطبع، جريء الروح ترف شرقي يجمع الأصالة والتميز"
            products={[
              { id: "thunayan-1", name: "روشن", brand: "ثنيان", price: 520, image: perfume1 },
              { id: "thunayan-2", name: "دكتاتور", brand: "ثنيان", price: 550, image: perfume2 },
              { id: "thunayan-3", name: "ممنوع", brand: "ثنيان", price: 480, image: perfume3 },
              { id: "thunayan-4", name: "ال اوف يو", brand: "ثنيان", price: 500, image: perfume4 },
            ]}
            viewMoreLink="/products?brand=ثنيان"
          />

          {/* قصة */}
          <ProductSection
            title="قصة"
            description="فصل جديد من قصة كل عطر يحكي فصلاً من أناقتك"
            products={[
              { id: "qissa-1", name: "لالونا", brand: "قصة", price: 580, image: perfume5 },
              { id: "qissa-2", name: "ون اند اونلي", brand: "قصة", price: 620, image: perfume6 },
              { id: "qissa-3", name: "هيدسون فالي", brand: "قصة", price: 590, image: perfume7 },
              { id: "qissa-4", name: "امبيريال فالي", brand: "قصة", price: 610, image: perfume8 },
            ]}
            viewMoreLink="/products?brand=قصة"
          />

          {/* العز للعود */}
          <ProductSection
            title="العز للعود"
            description="فخامة العود كما يجب أن تُروى"
            products={[
              { id: "alezoud-1", name: "عود فاخر", brand: "العز للعود", price: 720, image: perfume1, isNew: true },
              { id: "alezoud-2", name: "عود ملكي", brand: "العز للعود", price: 850, image: perfume2, isNew: true },
              { id: "alezoud-3", name: "عود العز", brand: "العز للعود", price: 680, image: perfume3 },
              { id: "alezoud-4", name: "عود مميز", brand: "العز للعود", price: 750, image: perfume4 },
            ]}
            viewMoreLink="/products?brand=العز للعود"
          />

          {/* دخون */}
          <ProductSection
            title="دخون"
            description="سر الجاذبية في مزيج من الفخامة والتراث"
            products={[
              { id: "dukhoon-1", name: "اميرالد عود", brand: "دخون", price: 380, image: perfume5 },
              { id: "dukhoon-2", name: "برايم", brand: "دخون", price: 420, image: perfume6 },
              { id: "dukhoon-3", name: "ماكس", brand: "دخون", price: 360, image: perfume7 },
              { id: "dukhoon-4", name: "ذاتي", brand: "دخون", price: 400, image: perfume8 },
            ]}
            viewMoreLink="/products?brand=دخون"
          />

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
    </div>;
};
export default Index;