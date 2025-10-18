# ميزة الصور المتعددة للمنتجات

## نظرة عامة
تم إضافة إمكانية رفع وعرض صور متعددة لكل منتج بدلاً من صورة واحدة فقط.

## التغييرات المنفذة

### 1. قاعدة البيانات

#### جدول `product_images`
تم إنشاء جدول جديد لتخزين الصور المتعددة:

```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**الحقول:**
- `id`: معرف فريد للصورة
- `product_id`: معرف المنتج (مرتبط بجدول products)
- `image_url`: رابط الصورة
- `display_order`: ترتيب عرض الصورة
- `is_primary`: هل هذه الصورة الرئيسية
- `created_at`, `updated_at`: تواريخ الإنشاء والتحديث

#### View `products_with_images`
تم إنشاء view لتسهيل جلب المنتجات مع أول صورة إضافية:

```sql
CREATE VIEW products_with_images AS
SELECT 
  p.*,
  pi.image_url as first_additional_image_url
FROM products p
LEFT JOIN LATERAL (
  SELECT image_url
  FROM product_images
  WHERE product_id = p.id
  ORDER BY display_order
  LIMIT 1
) pi ON true;
```

### 2. واجهة إدارة المنتجات (`ProductsManagement.tsx`)

#### الميزات الجديدة:
- **رفع صور متعددة**: يمكن للمسؤول اختيار عدة صور في نفس الوقت
- **معاينة الصور**: عرض جميع الصور المحددة قبل الرفع
- **إدارة الصور الموجودة**: 
  - عرض الصور المرفوعة مسبقاً
  - حذف الصور الفردية
  - ترتيب الصور حسب `display_order`

#### الحالات الجديدة (State):
```typescript
const [additionalImages, setAdditionalImages] = useState<File[]>([]);
const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
const [existingImages, setExistingImages] = useState<{id: string, image_url: string, display_order: number}[]>([]);
```

#### الوظائف الجديدة:
- `fetchProductImages()`: جلب الصور الموجودة عند التعديل
- `handleAdditionalImagesChange()`: معالجة اختيار صور متعددة
- `removeAdditionalImage()`: حذف صورة من القائمة قبل الرفع
- `removeExistingImage()`: حذف صورة مرفوعة من قاعدة البيانات

### 3. صفحة تفاصيل المنتج (`ProductDetails.tsx`)

#### معرض الصور:
- **الصورة الرئيسية الكبيرة**: عرض الصورة المختارة بحجم كبير
- **الصور المصغرة (Thumbnails)**: 
  - عرض جميع الصور في شبكة 4 أعمدة
  - تحديد الصورة المختارة بإطار ملون
  - التبديل بين الصور بالنقر على المصغرات

#### الحالات الجديدة:
```typescript
const [productImages, setProductImages] = useState<ProductImage[]>([]);
const [selectedImageIndex, setSelectedImageIndex] = useState(0);
```

#### الواجهة:
```typescript
interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}
```

### 4. ملف المساعدات (`lib/productHelpers.ts`)

تم إنشاء دوال مساعدة لإدارة الصور:

```typescript
// اختيار الصورة المناسبة للعرض
export const getProductDisplayImage = (
  imageUrl?: string, 
  firstAdditionalImage?: string, 
  fallbackUrl?: string
): string | undefined

// جلب الصورة الرئيسية للمنتج (async)
export const getProductImageUrl = async (
  productId: string, 
  fallbackUrl?: string
): Promise<string | undefined>

// جلب جميع صور المنتج
export const getProductImages = async (
  productId: string
): Promise<string[]>
```

## كيفية الاستخدام

### للمسؤول (Admin):

1. **إضافة منتج جديد:**
   - اذهب إلى "إدارة المنتجات"
   - اضغط "إضافة منتج جديد"
   - اختر صورة رئيسية (اختياري)
   - في حقل "صور إضافية للمنتج"، اختر عدة صور
   - احفظ المنتج

2. **تعديل منتج موجود:**
   - اضغط على زر التعديل للمنتج
   - ستظهر الصور الموجودة في قسم "الصور الموجودة"
   - يمكنك حذف أي صورة بالضغط على زر X
   - يمكنك إضافة صور جديدة
   - احفظ التغييرات

### للزائر:

1. **صفحة المنتجات:**
   - ستظهر الصورة الرئيسية أو أول صورة إضافية

2. **صفحة تفاصيل المنتج:**
   - الصورة الكبيرة في الأعلى
   - الصور المصغرة في الأسفل
   - اضغط على أي صورة مصغرة لعرضها بحجم كبير

## الأولويات في عرض الصور

1. **الصورة الرئيسية** (`image_url` في جدول products)
2. **أول صورة إضافية** (من جدول product_images حسب display_order)
3. **صورة افتراضية** (placeholder)

## ملاحظات تقنية

- جميع الصور تُرفع إلى Supabase Storage في bucket `product-images`
- الصور تُحذف تلقائياً عند حذف المنتج (CASCADE)
- Row Level Security (RLS) مفعّل على جدول product_images
- الصور مرتبة حسب `display_order` (الأصغر أولاً)

## التحسينات المستقبلية المقترحة

1. إمكانية إعادة ترتيب الصور بالسحب والإفلات (Drag & Drop)
2. تحديد صورة رئيسية من الصور الإضافية
3. تكبير الصورة في modal عند النقر عليها
4. دعم الفيديوهات بجانب الصور
5. ضغط الصور تلقائياً قبل الرفع لتحسين الأداء
