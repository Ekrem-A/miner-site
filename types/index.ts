export interface Category {
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
}

export interface Product {
  id: string | number;
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  image: string;
  image_urls?: string[]; // Ürün görselleri (JSON array)
  cloudinary_public_id?: string;
  category: string;
  featured?: boolean;
  description?: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  specs?: Record<string, string>;
  tags?: string[];
  is_campaign?: boolean;
  discount_percentage?: number;
  campaign_end_date?: string;
}

export interface Brand {
  name: string;
  logo?: string;
}

export interface User {
  email: string;
  password: string;
  name?: string;
}

export interface ProductFilters {
  brands: string[];
  priceRange: [number, number];
  inStock: boolean;
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest';
}