// Kategori tipi
export interface Category {
  id?: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
  created_at?: string;
}

// Supabase'den gelen ham ürün verisi
export interface ProductRaw {
  id: string | number;
  name: string;
  brand: string;
  price: number | null;
  original_price?: number | null;
  image_urls?: string[];
  category_id?: string;
  featured?: boolean;
  description?: string;
  in_stock: boolean;
  rating?: number;
  review_count?: number;
  specs?: Record<string, string>;
  tags?: string[];
  is_campaign?: boolean;
  discount_percentage?: number;
  campaign_end_date?: string;
  created_at?: string;
  updated_at?: string;
  // Mining spesifik alanları
  algorithm?: string;
  coin?: string;
  hashrate?: number;
  hashrate_unit?: string;
  power_consumption?: number;
}

// Frontend'de kullanılan formatlanmış ürün verisi
export interface Product {
  id: string | number;
  name: string;
  brand: string;
  price: string; // Formatlanmış fiyat (örn: "1.234,56")
  original_price?: string; // Formatlanmış orijinal fiyat
  image: string; // Ana görsel URL'i
  image_urls?: string[]; // Tüm görsel URL'leri
  category: string; // Kategori slug veya ismi
  category_id?: string;
  featured?: boolean;
  description?: string;
  in_stock: boolean;
  stock_quantity?: number;
  rating?: number;
  review_count?: number;
  specs?: Record<string, any>;
  tags?: string[];
  discount_percentage?: number;
  campaign_end_date?: string;
  slug?: string;
  // Mining spesifik alanları
  algorithm?: string;
  coin?: string;
  hashrate?: number;
  hashrate_unit?: string;
  power_consumption?: number;
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