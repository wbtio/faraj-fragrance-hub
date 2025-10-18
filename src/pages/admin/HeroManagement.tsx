import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save } from "lucide-react";

interface HeroContent {
  id?: string;
  title: string;
  subtitle: string;
  image_url: string;
  button_text: string;
  button_link: string;
}

const HeroManagement = () => {
  const { toast } = useToast();
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: "أفخم العطور العالمية",
    subtitle: "اكتشف تشكيلة واسعة من أرقى العطور من ديور، شانيل، غوتشي وأشهر العلامات التجارية العالمية",
    image_url: "",
    button_text: "تسوق الآن",
    button_link: "/products",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsUploading(true);

    try {
      let imageUrl = heroContent.image_url;

      // Upload image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          throw new Error("فشل رفع الصورة");
        }
      }

      const contentData = {
        ...heroContent,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      };

      if (heroContent.id) {
        // Update existing
        const { error } = await supabase
          .from("hero_content")
          .update(contentData)
          .eq("id", heroContent.id);

        if (error) throw error;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from("hero_content")
          .insert([contentData])
          .select()
          .single();

        if (error) throw error;
        if (data) setHeroContent(data);
      }

      toast({
        title: "تم الحفظ",
        description: "تم حفظ محتوى Hero Section بنجاح",
      });

      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      console.error("Error saving hero content:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل حفظ المحتوى",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">إدارة Hero Section</h1>
          <p className="text-muted-foreground mt-1">
            تعديل محتوى وصورة القسم الرئيسي في الصفحة الرئيسية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>تعديل المحتوى</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">العنوان الرئيسي</Label>
                  <Input
                    id="title"
                    value={heroContent.title}
                    onChange={(e) => setHeroContent({...heroContent, title: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">النص الفرعي</Label>
                  <Textarea
                    id="subtitle"
                    value={heroContent.subtitle}
                    onChange={(e) => setHeroContent({...heroContent, subtitle: e.target.value})}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="button_text">نص الزر</Label>
                  <Input
                    id="button_text"
                    value={heroContent.button_text}
                    onChange={(e) => setHeroContent({...heroContent, button_text: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="button_link">رابط الزر</Label>
                  <Input
                    id="button_link"
                    value={heroContent.button_link}
                    onChange={(e) => setHeroContent({...heroContent, button_link: e.target.value})}
                    placeholder="/products"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">صورة الخلفية</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploading}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="معاينة"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {heroContent.image_url && !imagePreview && (
                    <div className="mt-2">
                      <img
                        src={heroContent.image_url}
                        alt="الصورة الحالية"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  <Save className="h-4 w-4 ml-2" />
                  {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>معاينة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <div className="absolute inset-0">
                  <img
                    src={imagePreview || heroContent.image_url || "https://images.unsplash.com/photo-1541643600914-78b084683601"}
                    alt="Hero Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
                </div>
                <div className="relative h-full flex items-center p-8">
                  <div className="text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">
                      {heroContent.title}
                    </h2>
                    <p className="text-base md:text-lg mb-6 text-white/90">
                      {heroContent.subtitle}
                    </p>
                    <Button variant="hero" size="lg">
                      {heroContent.button_text}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HeroManagement;
