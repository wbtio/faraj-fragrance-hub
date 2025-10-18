import { supabase } from './supabase';

/**
 * Get the display image URL for a product
 * Returns the main image_url if available, otherwise returns the first additional image
 */
export const getProductDisplayImage = (imageUrl?: string, firstAdditionalImage?: string, fallbackUrl?: string): string | undefined => {
  return imageUrl || firstAdditionalImage || fallbackUrl;
};

/**
 * Get the primary image URL for a product (async version for when you need to fetch)
 * Returns the main image_url if available, otherwise returns the first image from product_images
 */
export const getProductImageUrl = async (productId: string, fallbackUrl?: string): Promise<string | undefined> => {
  try {
    // First, get the product's main image
    const { data: product } = await supabase
      .from('products')
      .select('image_url')
      .eq('id', productId)
      .single();

    if (product?.image_url) {
      return product.image_url;
    }

    // If no main image, get the first image from product_images
    const { data: images } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', productId)
      .order('display_order')
      .limit(1);

    if (images && images.length > 0) {
      return images[0].image_url;
    }

    return fallbackUrl;
  } catch (error) {
    console.error('Error fetching product image:', error);
    return fallbackUrl;
  }
};

/**
 * Get all images for a product (main image + additional images)
 */
export const getProductImages = async (productId: string): Promise<string[]> => {
  try {
    const images: string[] = [];

    // Get main image
    const { data: product } = await supabase
      .from('products')
      .select('image_url')
      .eq('id', productId)
      .single();

    if (product?.image_url) {
      images.push(product.image_url);
    }

    // Get additional images
    const { data: additionalImages } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', productId)
      .order('display_order');

    if (additionalImages) {
      images.push(...additionalImages.map(img => img.image_url));
    }

    return images;
  } catch (error) {
    console.error('Error fetching product images:', error);
    return [];
  }
};
