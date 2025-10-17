import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">سياسة الشحن</h1>
        <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-li:marker:text-muted-foreground" dir="rtl">
          <p className="text-muted-foreground">توضح هذه الصفحة تفاصيل الشحن، المدد الزمنية، والتكاليف.</p>
          <ul className="list-disc pr-6 space-y-2">
            <li>الطلبات تُعالج خلال 1-2 يوم عمل.</li>
            <li>مدة التوصيل تختلف حسب المدينة والمحافظة.</li>
            <li>رسوم الشحن تُعرض أثناء إتمام الطلب.</li>
            <li>يرجى التأكد من رقم الهاتف والعنوان لتسهيل عملية التوصيل.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;


