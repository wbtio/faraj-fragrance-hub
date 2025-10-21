import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Brand {
  id: string;
  name: string;
  name_ar: string;
  description?: string;
  description_ar?: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  show_in_header?: boolean;
}

const BrandsManagement = () => {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: "",
    name_ar: "",
    description: "",
    description_ar: "",
    slug: "",
    display_order: 0,
    is_active: true,
    show_in_header: false,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل البراندات",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate slug from name_ar if not provided
      const slug = formData.slug || formData.name_ar?.replace(/\s+/g, '-') || "";

      if (editingBrand) {
        // Update existing brand
        const { error } = await supabase
          .from("brands")
          .update({
            ...formData,
            slug,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingBrand.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث البراند بنجاح",
        });
      } else {
        // Create new brand
        const { error } = await supabase
          .from("brands")
          .insert([{ ...formData, slug }]);

        if (error) throw error;

        toast({
          title: "تم الإضافة",
          description: "تم إضافة البراند بنجاح",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchBrands();
    } catch (error: any) {
      console.error("Error saving brand:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل حفظ البراند",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData(brand);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا البراند؟ سيتم حذف جميع المنتجات المرتبطة به.")) return;

    try {
      const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف البراند بنجاح",
      });

      fetchBrands();
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast({
        title: "خطأ",
        description: "فشل حذف البراند",
        variant: "destructive",
      });
    }
  };

  const handleMoveUp = async (brand: Brand) => {
    const currentIndex = brands.findIndex(b => b.id === brand.id);
    if (currentIndex === 0) return;

    const previousBrand = brands[currentIndex - 1];
    
    try {
      await supabase
        .from("brands")
        .update({ display_order: previousBrand.display_order })
        .eq("id", brand.id);

      await supabase
        .from("brands")
        .update({ display_order: brand.display_order })
        .eq("id", previousBrand.id);

      fetchBrands();
    } catch (error) {
      console.error("Error reordering brands:", error);
    }
  };

  const handleMoveDown = async (brand: Brand) => {
    const currentIndex = brands.findIndex(b => b.id === brand.id);
    if (currentIndex === brands.length - 1) return;

    const nextBrand = brands[currentIndex + 1];
    
    try {
      await supabase
        .from("brands")
        .update({ display_order: nextBrand.display_order })
        .eq("id", brand.id);

      await supabase
        .from("brands")
        .update({ display_order: brand.display_order })
        .eq("id", nextBrand.id);

      fetchBrands();
    } catch (error) {
      console.error("Error reordering brands:", error);
    }
  };

  const resetForm = () => {
    setEditingBrand(null);
    setFormData({
      name: "",
      name_ar: "",
      description: "",
      description_ar: "",
      slug: "",
      display_order: brands.length,
      is_active: true,
      show_in_header: false,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">إدارة البراندات</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة براند جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBrand ? "تعديل براند" : "إضافة براند جديد"}
              </DialogTitle>
              <DialogDescription>
                املأ جميع الحقول المطلوبة
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_ar">الاسم بالعربي *</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">الاسم بالإنجليزي</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (للرابط)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="سيتم توليده تلقائياً"
                  />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_ar">الوصف بالعربي</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar || ""}
                  onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف بالإنجليزي</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked as boolean})}
                />
                <label htmlFor="is_active" className="text-sm font-medium">
                  نشط
                </label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="show_in_header"
                  checked={formData.show_in_header}
                  onCheckedChange={(checked) => setFormData({...formData, show_in_header: checked as boolean})}
                />
                <label htmlFor="show_in_header" className="text-sm font-medium">
                  عرض في الهيدر
                </label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "جاري الحفظ..." : editingBrand ? "تحديث" : "إضافة"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Brands Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الترتيب</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>عرض في الهيدر</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand, index) => (
              <TableRow key={brand.id}>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveUp(brand)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveDown(brand)}
                      disabled={index === brands.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{brand.name_ar}</TableCell>
                <TableCell className="max-w-md truncate">{brand.description_ar}</TableCell>
                <TableCell>
                  {brand.is_active ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">نشط</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">غير نشط</span>
                  )}
                </TableCell>
                <TableCell>
                  {brand.show_in_header ? (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">نعم</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">لا</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(brand)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(brand.id)}
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

      {brands.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد براندات
        </div>
      )}
      </div>
    </div>
  );
};

export default BrandsManagement;
