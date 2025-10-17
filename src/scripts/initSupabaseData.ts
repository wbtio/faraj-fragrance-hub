import { supabase } from '@/lib/supabase';

// This script initializes the Supabase database with sample data
// It should be run once to set up the initial data structure

async function initSupabaseData() {
  console.log('Initializing Supabase data...');
  
  try {
    // Insert sample brands
    const brands = [
      { name: "عساف", description: "تشكيلة فاخرة من أرقى العطور العالمية بلمسة عربية أصيلة" },
      { name: "لافيرن", description: "عطور عصرية بلمسة من الكلاسيكية الفرنسية" },
      { name: "ماتش", description: "عطور رياضية منعشة للحياة العصرية النشطة" },
      { name: "ريف", description: "عطور مميزة بتركيبات فريدة تناسب جميع الأوقات" },
      { name: "ثنيان", description: "عطور رجالية قوية تعكس الشخصية المميزة" },
      { name: "قصة", description: "روائح آسرة تحكي قصة من الفخامة والأناقة" },
      { name: "العز للعود", description: "عود فاخر بجودة استثنائية من أجود أنواع العود" },
      { name: "دخون", description: "بخور عربي أصيل بروائح تقليدية فاخرة" },
    ];

    const { error: brandsError } = await supabase
      .from('brands')
      .insert(brands);

    if (brandsError) {
      console.error('Error inserting brands:', brandsError);
    } else {
      console.log('Brands inserted successfully');
    }

    // Insert sample products
    const products = [
      // عساف products
      { name: "كراون", brand: "عساف", price: 380, description: "عطر فاخر بتركيز مميز" },
      { name: "سبيريت", brand: "عساف", price: 420, description: "عطر روحي ينعش الحواس" },
      { name: "فرانكل", brand: "عساف", price: 450, description: "عطر كلاسيكي بخetics فاخرة" },
      { name: "افيتو", brand: "عساف", price: 390, description: "عطر طبيعي مستوحى من النباتات" },
      
      // لافيرن products
      { name: "لافيرن كلاسيك", brand: "لافيرن", price: 320, description: "عطر كلاسيكي أنيق" },
      { name: "لافيرن رويال", brand: "لافيرن", price: 380, description: "عطر ملكي بتركيز عالي" },
      { name: "لافيرن بريميوم", brand: "لافيرن", price: 420, description: "عطر فاخر بجودة استثنائية" },
      
      // ماتش products
      { name: "ماتش كلاسيك", brand: "ماتش", price: 280, description: "عطر رياضي كلاسيكي", onSale: true },
      { name: "ماتش سبورت", brand: "ماتش", price: 300, description: "عطر للرياضة والنشاط", onSale: true },
      { name: "ماتش نايت", brand: "ماتش", price: 320, description: "عطر للمناسبات الليلية" },
    ];

    const { error: productsError } = await supabase
      .from('products')
      .insert(products);

    if (productsError) {
      console.error('Error inserting products:', productsError);
    } else {
      console.log('Products inserted successfully');
    }

    console.log('Supabase data initialization complete!');
  } catch (error) {
    console.error('Error initializing Supabase data:', error);
  }
}

// Run the initialization if this script is executed directly
if (typeof window === 'undefined') {
  initSupabaseData();
}

export default initSupabaseData;