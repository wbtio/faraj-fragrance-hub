import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  image: string;
}

export const HeroSection = ({ image }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-luxury">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt="Hero Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            أفخم العطور العالمية
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
            اكتشف تشكيلة واسعة من أرقى العطور من ديور، شانيل، غوتشي وأشهر العلامات التجارية العالمية
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="hero" 
              size="lg" 
              className="gap-2"
              onClick={() => navigate("/products")}
            >
              <span>تسوق الآن</span>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              onClick={() => navigate("/products?category=new")}
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
