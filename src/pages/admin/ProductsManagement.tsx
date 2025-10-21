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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Search, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  name_ar: string;
  brand_id: string;
  category_id: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  size?: string;
  volume?: string;
  weight?: string;
  gender?: string;
  is_new: boolean;
  is_on_sale: boolean;
  is_active: boolean;
  description?: string;
  description_ar?: string;
  image_url?: string;
  fragrance_type?: string;
  top_notes?: string;
  middle_notes?: string;
  base_notes?: string;
}

interface Brand {
  id: string;
  name_ar: string;
}

interface Category {
  id: string;
  name_ar: string;
}

const ProductsManagement = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<{id: string, image_url: string, display_order: number}[]>([]);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    name_ar: "",
    brand_id: "",
    category_id: "",
    price: 0,
    original_price: 0,
    stock_quantity: 0,
    size: "",
    volume: "",
    weight: "",
    gender: "",
    is_new: false,
    is_on_sale: false,
    is_active: true,
    description: "",
    description_ar: "",
    fragrance_type: "",
    top_notes: "",
    middle_notes: "",
    base_notes: "",
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "خطأ",
        description: "فشل تحميل المنتجات",
        variant: "destructive",
      });
    }
  };

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .select("id, name_ar")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name_ar")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProductCategories = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from("product_categories")
        .select("category_id")
        .eq("product_id", productId);

      if (error) throw error;
      return data?.map(item => item.category_id) || [];
    } catch (error) {
      console.error("Error fetching product categories:", error);
      return [];
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

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

  const fetchProductImages = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order');
      
      if (error) throw error;
      setExistingImages(data || []);
    } catch (error) {
      console.error('Error fetching product images:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate categories
    if (selectedCategories.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار فئة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    // Validate brand
    if (!formData.brand_id) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار البراند",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setIsUploading(true);

    try {
      let imageUrl = formData.image_url;

      // Upload image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          throw new Error("فشل رفع الصورة");
        }
      }

      const productData = {
        ...formData,
        image_url: imageUrl,
        // Remove category_id since we're using multiple categories now
        category_id: null,
        // Clean up empty string fields that should be null
        name: formData.name || null,
        description: formData.description || null,
        description_ar: formData.description_ar || null,
        size: formData.size || null,
        volume: formData.volume || null,
        weight: formData.weight || null,
        gender: formData.gender || null,
        fragrance_type: formData.fragrance_type || null,
        top_notes: formData.top_notes || null,
        middle_notes: formData.middle_notes || null,
        base_notes: formData.base_notes || null,
      };

      let productId: string;

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            ...productData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingProduct.id);

        if (error) throw error;
        productId = editingProduct.id;

        toast({
          title: "تم التحديث",
          description: "تم تحديث المنتج بنجاح",
        });
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert([productData])
          .select()
          .single();

        if (error) throw error;
        productId = newProduct.id;

        toast({
          title: "تم الإضافة",
          description: "تم إضافة المنتج بنجاح",
        });
      }

      // Upload and save additional images
      if (additionalImages.length > 0) {
        for (let i = 0; i < additionalImages.length; i++) {
          const uploadedUrl = await uploadImage(additionalImages[i]);
          if (uploadedUrl) {
            await supabase
              .from('product_images')
              .insert([{
                product_id: productId,
                image_url: uploadedUrl,
                display_order: i + 1,
                is_primary: i === 0 && !imageUrl
              }]);
          }
        }
      }

      // Save product categories
      if (selectedCategories.length > 0) {
        // Delete existing categories first
        await supabase
          .from('product_categories')
          .delete()
          .eq('product_id', productId);

        // Insert new categories
        const categoryInserts = selectedCategories.map(categoryId => ({
          product_id: productId,
          category_id: categoryId
        }));

        await supabase
          .from('product_categories')
          .insert(categoryInserts);
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل حفظ المنتج",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    await fetchProductImages(product.id);
    
    // Fetch product categories
    const productCategories = await fetchProductCategories(product.id);
    setSelectedCategories(productCategories);
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج بنجاح",
      });

      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "خطأ",
        description: "فشل حذف المنتج",
        variant: "destructive",
      });
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

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAdditionalImages(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdditionalImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
      
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast({
        title: "تم الحذف",
        description: "تم حذف الصورة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "خطأ",
        description: "فشل حذف الصورة",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
    setAdditionalImages([]);
    setAdditionalImagePreviews([]);
    setExistingImages([]);
    setSelectedCategories([]);
    setFormData({
      name: "",
      name_ar: "",
      brand_id: "",
      category_id: "",
      price: 0,
      original_price: 0,
      stock_quantity: 0,
      size: "",
      volume: "",
      weight: "",
      gender: "",
      is_new: false,
      is_on_sale: false,
      is_active: true,
      description: "",
      description_ar: "",
      fragrance_type: "",
      top_notes: "",
      middle_notes: "",
      base_notes: "",
    });
  };

  const filteredProducts = products.filter(product =>
    product.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name_ar || "-";
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name_ar || "-";
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}
              </DialogTitle>
              <DialogDescription>
                املأ جميع الحقول المطلوبة لإضافة منتج جديد
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Basic Info */}
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
                  <Label htmlFor="brand_id">البراند *</Label>
                  <Select
                    value={formData.brand_id}
                    onValueChange={(value) => setFormData({...formData, brand_id: value})}
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
                  <Label>الفئات *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category.id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                            }
                          }}
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                          {category.name_ar}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedCategories.length === 0 && (
                    <p className="text-sm text-muted-foreground">يرجى اختيار فئة واحدة على الأقل</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">السعر (دينار) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">السعر الأصلي (للعروض)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price || ""}
                    onChange={(e) => setFormData({...formData, original_price: parseFloat(e.target.value) || undefined})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">الكمية المتوفرة</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">صورة المنتج الرئيسية</Label>
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
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                {formData.image_url && !imagePreview && (
                  <div className="mt-2">
                    <img
                      src={formData.image_url}
                      alt="الصورة الحالية"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Additional Images Upload */}
              <div className="space-y-2">
                <Label htmlFor="additional-images">صور إضافية للمنتج</Label>
                <Input
                  id="additional-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImagesChange}
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">يمكنك اختيار عدة صور في نفس الوقت</p>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">الصور الموجودة:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative group">
                          <img
                            src={img.image_url}
                            alt="صورة المنتج"
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.id)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Images Preview */}
                {additionalImagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">صور جديدة للرفع:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {additionalImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`معاينة ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(index)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">الجنس</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({...formData, gender: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="men">رجالي</SelectItem>
                      <SelectItem value="women">نسائي</SelectItem>
                      <SelectItem value="unisex">للجنسين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volume">الحجم (مل)</Label>
                  <Input
                    id="volume"
                    value={formData.volume || ""}
                    onChange={(e) => setFormData({...formData, volume: e.target.value})}
                    placeholder="مثال: 100ml"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">الوزن</Label>
                  <Input
                    id="weight"
                    value={formData.weight || ""}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="مثال: 150g"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">الحجم</Label>
                  <Input
                    id="size"
                    value={formData.size || ""}
                    onChange={(e) => setFormData({...formData, size: e.target.value})}
                    placeholder="مثال: كبير، متوسط، صغير"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fragrance_type">نوع العطر</Label>
                  <Input
                    id="fragrance_type"
                    value={formData.fragrance_type || ""}
                    onChange={(e) => setFormData({...formData, fragrance_type: e.target.value})}
                    placeholder="مثال: Eau de Parfum"
                  />
                </div>
              </div>

              {/* Fragrance Notes */}
              <div className="space-y-2">
                <Label htmlFor="top_notes">المكونات العلوية</Label>
                <Textarea
                  id="top_notes"
                  value={formData.top_notes || ""}
                  onChange={(e) => setFormData({...formData, top_notes: e.target.value})}
                  placeholder="مثال: البرغموت، الليمون، النعناع"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="middle_notes">المكونات الوسطى</Label>
                <Textarea
                  id="middle_notes"
                  value={formData.middle_notes || ""}
                  onChange={(e) => setFormData({...formData, middle_notes: e.target.value})}
                  placeholder="مثال: الياسمين، الورد، اللافندر"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="base_notes">المكونات القاعدية</Label>
                <Textarea
                  id="base_notes"
                  value={formData.base_notes || ""}
                  onChange={(e) => setFormData({...formData, base_notes: e.target.value})}
                  placeholder="مثال: العنبر، المسك، خشب الصندل"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description_ar">الوصف بالعربي</Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar || ""}
                  onChange={(e) => setFormData({...formData, description_ar: e.target.value})}
                  rows={3}
                />
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="is_new"
                    checked={formData.is_new}
                    onCheckedChange={(checked) => setFormData({...formData, is_new: checked as boolean})}
                  />
                  <label htmlFor="is_new" className="text-sm font-medium">
                    منتج جديد
                  </label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="is_on_sale"
                    checked={formData.is_on_sale}
                    onCheckedChange={(checked) => setFormData({...formData, is_on_sale: checked as boolean})}
                  />
                  <label htmlFor="is_on_sale" className="text-sm font-medium">
                    في العروض
                  </label>
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
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "جاري الحفظ..." : editingProduct ? "تحديث" : "إضافة"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>البراند</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>الكمية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name_ar}</TableCell>
                <TableCell>{getBrandName(product.brand_id)}</TableCell>
                <TableCell>{getCategoryName(product.category_id)}</TableCell>
                <TableCell>{product.price} د.ع</TableCell>
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {product.is_new && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">جديد</span>
                    )}
                    {product.is_on_sale && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">عرض</span>
                    )}
                    {!product.is_active && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">غير نشط</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product.id)}
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          لا توجد منتجات
        </div>
      )}
      </div>
    </div>
  );
};

export default ProductsManagement;
