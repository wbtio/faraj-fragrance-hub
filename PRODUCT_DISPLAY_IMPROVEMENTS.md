# تحسينات عرض المنتجات

## التعديلات المنفذة

### 1. تكبير حجم اسم المنتج
- **الملف**: `src/components/ProductCard.tsx`
- **التغيير**: تم تكبير حجم خط اسم المنتج من `text-sm` إلى `text-base`
- **التغيير**: تم تغيير font-weight من `font-semibold` إلى `font-bold` لجعله أكثر وضوحاً
- **السطر**: 203

### 2. إضافة عرض حجم العطر (Volume)
تم إضافة عرض حجم العطر في جميع الأماكن التالية:

#### أ. ProductCard Component
- **الملف**: `src/components/ProductCard.tsx`
- **التعديلات**:
  - إضافة `volume?: string` للـ interface (السطر 20)
  - إضافة `volume` للـ props (السطر 33)
  - عرض الحجم تحت اسم المنتج (السطور 205-208)

#### ب. صفحة تفاصيل المنتج
- **الملف**: `src/pages/ProductDetails.tsx`
- **التعديلات**:
  - إضافة `volume?: string` للـ Product interface (السطر 28)
  - عرض الحجم في صفحة التفاصيل مع تنسيق خاص (السطور 371-378)
  - تمرير `volume` للمنتجات المشابهة (السطر 543)

#### ج. صفحات المنتجات الأخرى
تم تحديث الملفات التالية لدعم حقل `volume`:

1. **src/components/ProductSection.tsx**
   - إضافة `volume?: string` للـ Product interface

2. **src/pages/Products.tsx**
   - إضافة `volume?: string` للـ Product interface
   - تمرير `volume` للـ ProductCard

3. **src/pages/ProductsNew.tsx**
   - إضافة `volume?: string` للـ Product interface
   - تمرير `volume` للـ ProductCard

4. **src/pages/Search.tsx**
   - إضافة `volume?: string` للـ Product interface
   - تمرير `volume` للـ ProductCard

## كيفية استخدام التحديثات

### إضافة حجم العطر للمنتجات
1. افتح لوحة الإدارة: `/admin/products`
2. عند إضافة أو تعديل منتج، املأ حقل "الحجم (مل)"
3. مثال: `100ml` أو `50 مل` أو `3.4 oz`

### عرض الحجم
- **في بطاقة المنتج**: يظهر الحجم تحت اسم المنتج بخط صغير رمادي
- **في صفحة التفاصيل**: يظهر الحجم في قسم المعلومات مع تنسيق أكبر

## ملاحظات
- حقل الحجم اختياري (optional)
- إذا لم يتم إدخال حجم للمنتج، لن يظهر شيء
- التنسيق متجاوب مع جميع أحجام الشاشات
- الحجم يظهر باللون الرمادي الفاتح ليكون واضحاً دون أن يطغى على المعلومات الأساسية

## الملفات المعدلة
1. `src/components/ProductCard.tsx` - 3 تعديلات
2. `src/components/ProductSection.tsx` - 1 تعديل
3. `src/pages/ProductDetails.tsx` - 3 تعديلات
4. `src/pages/Products.tsx` - 2 تعديل
5. `src/pages/ProductsNew.tsx` - 2 تعديل
6. `src/pages/Search.tsx` - 2 تعديل

## التاريخ
- **تاريخ التنفيذ**: 5 نوفمبر 2025
- **الحالة**: ✅ مكتمل
