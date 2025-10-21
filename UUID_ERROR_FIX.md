# 🔧 إصلاح خطأ UUID في إضافة المنتجات

## 🚨 المشكلة

كان يحدث خطأ عند إضافة منتج جديد:
```
Error: invalid input syntax for type uuid: ""
```

## 🔍 السبب

المشكلة كانت في:
1. **`category_id` فارغ**: كان يتم إرسال string فارغ `""` بدلاً من `null`
2. **حقول أخرى فارغة**: بعض الحقول كانت ترسل strings فارغة بدلاً من `null`
3. **عدم التحقق من البراند**: لم يكن هناك تحقق من اختيار البراند

## ✅ الحل المطبق

### 1. تنظيف البيانات المرسلة:
```typescript
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
```

### 2. إضافة التحقق من البراند:
```typescript
// Validate brand
if (!formData.brand_id) {
  toast({
    title: "خطأ",
    description: "يرجى اختيار البراند",
    variant: "destructive",
  });
  return;
}
```

### 3. إزالة `category_id` من البيانات:
- تم تعيين `category_id: null` لأننا نستخدم الفئات المتعددة الآن
- الفئات المتعددة تُحفظ في جدول `product_categories` منفصل

## 🎯 النتيجة

- ✅ لا مزيد من أخطاء UUID
- ✅ إضافة المنتجات تعمل بشكل صحيح
- ✅ الفئات المتعددة تُحفظ بشكل منفصل
- ✅ التحقق من البيانات المطلوبة

## 📋 كيفية الاختبار

1. اذهب إلى `/admin/products`
2. اضغط "إضافة منتج جديد"
3. املأ البيانات:
   - الاسم بالعربي: مطلوب
   - البراند: مطلوب (اختر من القائمة)
   - الفئات: مطلوب (اختر فئة واحدة على الأقل)
   - السعر: مطلوب
4. احفظ المنتج

**يجب أن يعمل بدون أخطاء الآن! ✅**
