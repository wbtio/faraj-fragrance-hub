import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
interface CategoryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  items: string[];
}
interface PerfumeCategoryCarouselProps {
  categories: CategoryItem[];
}
export const PerfumeCategoryCarousel = ({
  categories
}: PerfumeCategoryCarouselProps) => {
  return <div className="relative">
      <Carousel opts={{
      align: "center",
      loop: true
    }} className="w-full max-w-7xl mx-auto">
        
        
        {/* Navigation Arrows */}
        <CarouselPrevious className="hidden md:flex -left-16 w-12 h-12 border-2 hover:scale-110 transition-all" />
        <CarouselNext className="hidden md:flex -right-16 w-12 h-12 border-2 hover:scale-110 transition-all" />
      </Carousel>
    </div>;
};