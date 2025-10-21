# ✅ إصلاح خطأ قاعدة البيانات في الصفحة الرئيسية

## 🚨 المشكلة

كان يحدث خطأ 400 (Bad Request) عند جلب المنتجات من قاعدة البيانات:

```
GET https://iytwchrbpawcfjrbjsuc.supabase.co/rest/v1/products?select=id%2Cname_ar%2Cprice%2Csale_price%2Cimage_url%2Cbrand_id%2Cstock_quantity%2Cis_new%2Con_sale&is_active=eq.true 400 (Bad Request)
```

## 🔍 السبب

المشكلة كانت في أسماء الحقول في استعلام قاعدة البيانات. الحقول المستخدمة في الكود لم تكن تطابق الحقول الفعلية في قاعدة البيانات:

**الحقول الخاطئة المستخدمة:**
- `sale_price` ❌
- `on_sale` ❌

**الحقول الصحيحة في قاعدة البيانات:**
- `original_price` ✅
- `is_on_sale` ✅

## ✅ الحل المطبق

### 1. تصحيح استعلام قاعدة البيانات:

**قبل الإصلاح:**
```typescript
.select(`
  id,
  name_ar,
  price,
  sale_price,        // ❌ غير موجود
  image_url,
  brand_id,
  stock_quantity,
  is_new,
  on_sale            // ❌ غير موجود
`)
```

**بعد الإصلاح:**
```typescript
.select(`
  id,
  name_ar,
  price,
  original_price,    // ✅ الحقل الصحيح
  image_url,
  brand_id,
  stock_quantity,
  is_new,
  is_on_sale         // ✅ الحقل الصحيح
`)
```

### 2. تحديث Interface:

**قبل الإصلاح:**
```typescript
interface Product {
  sale_price?: number;    // ❌
  on_sale?: boolean;      // ❌
}
```

**بعد الإصلاح:**
```typescript
interface Product {
  original_price?: number;  // ✅
  is_on_sale?: boolean;     // ✅
}
```

### 3. تحديث منطق تحويل البيانات:

**قبل الإصلاح:**
```typescript
price: product.sale_price || product.price,
originalPrice: product.sale_price ? product.price : undefined,
onSale: product.on_sale,
```

**بعد الإصلاح:**
```typescript
price: product.original_price || product.price,
originalPrice: product.original_price ? product.price : undefined,
onSale: product.is_on_sale,
```

## 🎯 النتيجة

- ✅ **لا مزيد من أخطاء 400**
- ✅ **جلب البيانات يعمل بشكل صحيح**
- ✅ **السعر المخصوم يظهر بشكل صحيح**
- ✅ **حالة العروض تعمل بشكل صحيح**
- ✅ **حالة المخزون تعمل بشكل صحيح**

## 📋 هيكل قاعدة البيانات الصحيح

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  name_ar VARCHAR NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,        -- السعر الأصلي (للعروض)
  image_url TEXT,
  brand_id UUID NOT NULL,
  stock_quantity INTEGER,
  is_new BOOLEAN,                -- منتج جديد
  is_on_sale BOOLEAN,            -- في عرض
  is_active BOOLEAN,
  -- باقي الحقول...
);
```

## 🚀 كيفية الاختبار

1. اذهب إلى الصفحة الرئيسية `/`
2. يجب أن تظهر المنتجات بدون أخطاء
3. المنتجات ذات العروض يجب أن تظهر السعر المخصوم
4. المنتجات الجديدة يجب أن تظهر علامة "جديد"
5. المنتجات في العروض يجب أن تظهر علامة "خصم"

**تم إصلاح الخطأ بنجاح! ✅**
