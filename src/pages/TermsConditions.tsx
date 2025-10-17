import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">الشروط والأحكام</h1>
        <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-li:marker:text-muted-foreground" dir="rtl">
          <p className="text-muted-foreground">باستخدامك لموقعنا، فإنك توافق على الشروط التالية:</p>
          <ul className="list-disc pr-6 space-y-2">
            <li>الأسعار والعروض قد تتغير دون إشعار مسبق.</li>
            <li>الاستخدام لا يجوز أن ينتهك القوانين المحلية المعمول بها.</li>
            <li>سياسة الإرجاع والاستبدال تخضع للشروط المعلنة لدينا.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsConditions;


