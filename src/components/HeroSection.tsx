import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface HeroSectionProps {
  image?: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
}

export const HeroSection = ({ image }: HeroSectionProps) => {
  const navigate = useNavigate();
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_content")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setHeroContent(data);
      }
    } catch (error) {
      console.error("Error fetching hero content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // استخدام المحتوى من قاعدة البيانات أو القيم الافتراضية
  const displayImage = heroContent?.image_url || image || "https://images.unsplash.com/photo-1541643600914-78b084683601";
  const displayTitle = heroContent?.title || "أفخم العطور العالمية";
  const displaySubtitle = heroContent?.subtitle || "اكتشف تشكيلة واسعة من أرقى العطور من ديور، شانيل، غوتشي وأشهر العلامات التجارية العالمية";
  const displayButtonText = heroContent?.button_text || "تسوق الآن";
  const displayButtonLink = heroContent?.button_link || "/products";

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-luxury">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={displayImage}
          alt="Hero Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            {displayTitle}
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
            {displaySubtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="gap-2"
              onClick={() => navigate(displayButtonLink)}
            >
              <span>{displayButtonText}</span>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={() => navigate("/products")}
            >
              اكتشف المزيد
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};
