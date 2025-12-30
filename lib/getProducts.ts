import supabase from './supabase';
import { Product } from '@/types';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';

function formatPriceTurkish(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  // Ensure two decimals
  const fixed = value.toFixed(2);
  // Replace decimal point with comma and add thousand separators with dot
  const parts = fixed.split('.');
  const intPart = parts[0];
  const decPart = parts[1];
  const withThousand = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withThousand},${decPart}`;
}

export async function fetchProducts(): Promise<Product[]> {
  // Fetch categories once to map ids to slugs/names
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug');

  if (catError) {
    console.error('Error fetching categories:', catError.message);
    throw catError;
  }

  const catMap: Record<string, { name: string; slug: string }> = {};
  (categories || []).forEach((c: any) => {
    catMap[c.id] = { name: c.name, slug: c.slug };
  });

  // Fetch products
  const { data, error } = await supabase
    .from('products')
    .select(
      `id, name, brand, price, original_price, description, image_urls, in_stock, rating, review_count, specs, tags, featured, category_id, is_campaign, discount_percentage, campaign_end_date`
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }

  const products: Product[] = (data || []).map((p: any) => {
    const priceNumber = p.price !== null ? Number(p.price) : null;
    const originalPriceNumber = p.original_price !== null ? Number(p.original_price) : null;

    const categoryInfo = p.category_id ? catMap[p.category_id] : undefined;


    // Cloudinary cloud name helper
    const getCloudName = () => {
      const direct = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (direct) return direct;
      const url = process.env.CLOUDINARY_URL;
      if (url) {       
        const match = url.match(/@([a-zA-Z0-9_-]+)$/);
        if (match) return match[1];
      }
      return '';
    };
    const cloudName = getCloudName();
    const cld = cloudName ? new Cloudinary({ cloud: { cloudName } }) : null;
    const defaultWidth = Number(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_WIDTH) || 600;
    const defaultHeight = Number(process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_HEIGHT) || 400;

    let imageUrls: string[] = [];
    
    // image_urls array'ini işle
    if (p.image_urls && Array.isArray(p.image_urls) && p.image_urls.length > 0) {
      imageUrls = p.image_urls.map((url: string) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        } else if (cld) {
          try {
            const img = cld.image(url);
            img.resize(fill().width(defaultWidth).height(defaultHeight));
            return img.toURL();
          } catch (e) {
            return url;
          }
        }
        return url;
      });
    }

    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: formatPriceTurkish(priceNumber),
      originalPrice: originalPriceNumber !== null ? formatPriceTurkish(originalPriceNumber) : undefined,
      image: imageUrls.length > 0 ? imageUrls[0] : '',
      image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      category: categoryInfo ? categoryInfo.slug || categoryInfo.name : '',
      featured: !!p.featured,
      description: p.description || undefined,
      inStock: p.in_stock ?? true,
      rating: p.rating ?? undefined,
      reviewCount: p.review_count ?? undefined,
      specs: p.specs ?? undefined,
      tags: p.tags ?? undefined,
      is_campaign: p.is_campaign ?? false,
      discount_percentage: p.discount_percentage ?? undefined,
      campaign_end_date: p.campaign_end_date ?? undefined,
    } as Product;
  });

  return products;
}

export default fetchProducts;