import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">سياسة الخصوصية</h1>
        <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-li:marker:text-muted-foreground" dir="rtl">
          <p className="text-muted-foreground">نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>
          <ul className="list-disc pr-6 space-y-2">
            <li>نستخدم بياناتك لمعالجة الطلبات وتحسين التجربة.</li>
            <li>لا نشارك معلوماتك مع أطراف خارجية إلا عند الضرورة القانونية.</li>
            <li>يمكنك طلب تحديث أو حذف بياناتك بالتواصل معنا.</li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;


