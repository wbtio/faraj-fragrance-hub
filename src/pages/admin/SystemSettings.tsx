import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const SystemSettings = () => {
  const { toast } = useToast();
  const [maxHeaderBrands, setMaxHeaderBrands] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", "max_header_brands")
        .single();

      if (data?.setting_value) {
        setMaxHeaderBrands(parseInt(data.setting_value));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("system_settings")
        .upsert({
          setting_key: "max_header_brands",
          setting_value: maxHeaderBrands.toString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "خطأ",
        description: "فشل حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">إعدادات النظام</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الهيدر</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxHeaderBrands">عدد البراندات المعروضة في الهيدر</Label>
                <Input
                  id="maxHeaderBrands"
                  type="number"
                  min="1"
                  max="10"
                  value={maxHeaderBrands}
                  onChange={(e) => setMaxHeaderBrands(parseInt(e.target.value) || 4)}
                />
                <p className="text-sm text-muted-foreground">
                  حدد عدد البراندات التي تريد عرضها في الهيدر (1-10)
                </p>
              </div>
              
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "جاري الحفظ..." : "حفظ الإعدادات"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معلومات إضافية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• البراندات المعروضة في الهيدر هي التي تم تحديدها في إدارة البراندات</p>
                <p>• يمكن تحديد البراندات من خلال خيار "عرض في الهيدر"</p>
                <p>• الترتيب يعتمد على ترتيب العرض في إدارة البراندات</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
