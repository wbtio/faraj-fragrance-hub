import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Brand {
  id: string;
  name_ar: string;
  description_ar?: string;
}

interface Product {
  id: string;
  name_ar: string;
  price: number;
  brand_id: string;
}

interface HomepageSection {
  id: string;
  title: string;
  brand_id: string;
  display_order: number;
  is_active: boolean;
  product_ids: string[];
}

const HomepageManagement = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  
  const [formData, setFormData] = useState<Partial<HomepageSection>>({
    title: "",
    brand_id: "",
    display_order: 0,
    is_active: true,
    product_ids: [],
  });

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchSections();
    fetchBrands();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (formData.brand_id) {
      const filtered = products.filter(p => p.brand_id === formData.brand_id);
      setAvailableProducts(filtered);
    } else {
      setAvailableProducts([]);
    }
  }, [formData.brand_id, products]);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل الأقسام",
        variant: "destructive",
      });
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name_ar, description_ar")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name_ar, price, brand_id")
        .eq("is_active", true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      toast({
        title: "تنبيه",
        description: "يرجى اختيار منتج واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    if (selectedProducts.length > 4) {
      toast({
        title: "تنبيه",
        description: "الحد الأقصى 4 منتجات لكل قسم",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const sectionData = {
        ...formData,
        product_ids: selectedProducts,
      };

      if (editingSection) {
        const { error } = await supabase
          .from("homepage_sections")
          .update({
            ...sectionData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingSection.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث القسم بنجاح",
        });
      } else {
        const { error } = await supabase
          .from("homepage_sections")
          .insert([sectionData]);

        if (error) throw error;

        toast({
          title: "تم الإضافة",
          description: "تم إضافة القسم بنجاح",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSections();
    } catch (error) {
      console.error("Error saving section:", error);
      toast({
        title: "خطأ",
        description: "فشل حفظ القسم",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (section: HomepageSection) => {
    setEditingSection(section);
    setFormData(section);
    setSelectedProducts(section.product_ids || []);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;

    try {
      const { error } = await supabase
        .from("homepage_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف القسم بنجاح",
      });

      fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast({
        title: "خطأ",
        description: "فشل حذف القسم",
        variant: "destructive",
      });
    }
  };

  const handleMoveUp = async (section: HomepageSection) => {
    const currentIndex = sections.findIndex(s => s.id === section.id);
    if (currentIndex === 0) return;

    const previousSection = sections[currentIndex - 1];
    
    try {
      await supabase
        .from("homepage_sections")
        .update({ display_order: previousSection.display_order })
        .eq("id", section.id);

      await supabase
        .from("homepage_sections")
        .update({ display_order: section.display_order })
        .eq("id", previousSection.id);

      fetchSections();
    } catch (error) {
      console.error("Error reordering sections:", error);
    }
  };

  const handleMoveDown = async (section: HomepageSection) => {
    const currentIndex = sections.findIndex(s => s.id === section.id);
    if (currentIndex === sections.length - 1) return;

    const nextSection = sections[currentIndex + 1];
    
    try {
      await supabase
        .from("homepage_sections")
        .update({ display_order: nextSection.display_order })
        .eq("id", section.id);

      await supabase
        .from("homepage_sections")
        .update({ display_order: section.display_order })
        .eq("id", nextSection.id);

      fetchSections();
    } catch (error) {
      console.error("Error reordering sections:", error);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        if (prev.length >= 4) {
          toast({
            title: "تنبيه",
            description: "الحد الأقصى 4 منتجات لكل قسم",
            variant: "destructive",
          });
          return prev;
        }
        return [...prev, productId];
      }
    });
  };

  const resetForm = () => {
    setEditingSection(null);
    setFormData({
      title: "",
      brand_id: "",
      display_order: sections.length,
      is_active: true,
      product_ids: [],
    });
    setSelectedProducts([]);
  };

  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name_ar || "-";
  };

  const getBrandDescription = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.description_ar || "";
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name_ar || "-";
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة الصفحة الرئيسية</h1>
          <p className="text-muted-foreground mt-1">
            إدارة أقسام البراندات والمنتجات المعروضة
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة قسم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSection ? "تعديل قسم" : "إضافة قسم جديد"}
              </DialogTitle>
              <DialogDescription>
                اختر براند و 4 منتجات كحد أقصى لعرضها في الصفحة الرئيسية
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان القسم *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="مثال: أحدث عطور ديور"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand_id">البراند *</Label>
                  <Select
                    value={formData.brand_id}
                    onValueChange={(value) => {
                      setFormData({...formData, brand_id: value});
                      setSelectedProducts([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر البراند" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">ترتيب العرض</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                  />
                </div>

                <div className="flex items-center space-x-2 space-x-reverse pt-8">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked as boolean})}
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    نشط
                  </label>
                </div>
              </div>

              {/* Brand Description */}
              {formData.brand_id && getBrandDescription(formData.brand_id) && (
                <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                  <Label className="text-sm font-semibold">وصف البراند</Label>
                  <p className="text-sm text-muted-foreground">
                    {getBrandDescription(formData.brand_id)}
                  </p>
                </div>
              )}

              {/* Product Selection */}
              <div className="space-y-2">
                <Label>المنتجات المختارة ({selectedProducts.length}/4)</Label>
                <div className="flex flex-wrap gap-2 min-h-[50px] border rounded-lg p-3">
                  {selectedProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">لم يتم اختيار منتجات بعد</p>
                  ) : (
                    selectedProducts.map(productId => (
                      <div key={productId} className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-md">
                        <span className="text-sm">{getProductName(productId)}</span>
                        <button
                          type="button"
                          onClick={() => toggleProductSelection(productId)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {formData.brand_id && (
                <div className="space-y-2">
                  <Label>المنتجات المتاحة</Label>
                  <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                    {availableProducts.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4">لا توجد منتجات لهذا البراند</p>
                    ) : (
                      <div className="divide-y">
                        {availableProducts.map((product) => (
                          <div
                            key={product.id}
                            className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                              selectedProducts.includes(product.id) ? 'bg-primary/10' : ''
                            }`}
                            onClick={() => toggleProductSelection(product.id)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{product.name_ar}</span>
                              <span className="text-sm text-muted-foreground">{product.price} د.ع</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "جاري الحفظ..." : editingSection ? "تحديث" : "إضافة"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sections Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الترتيب</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>البراند</TableHead>
              <TableHead>عدد المنتجات</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section, index) => (
              <TableRow key={section.id}>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveUp(section)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveDown(section)}
                      disabled={index === sections.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{section.title}</TableCell>
                <TableCell>{getBrandName(section.brand_id)}</TableCell>
                <TableCell>{section.product_ids?.length || 0} منتجات</TableCell>
                <TableCell>
                  {section.is_active ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">نشط</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">غير نشط</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(section)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sections.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد أقسام
        </div>
      )}
      </div>
    </div>
  );
};

export default HomepageManagement;
