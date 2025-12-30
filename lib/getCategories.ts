import supabase from './supabase';
import { Category } from '@/types';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon, color, description')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error.message);
    throw error;
  }

  // Map Postgres rows to Category interface (keep slug & name)
  const categories: Category[] = (data || []).map((c: any) => ({
    name: c.name,
    slug: c.slug,
    icon: c.icon || '',
    color: c.color || '',
    description: c.description || undefined,
  }));

  return categories;
}

export default fetchCategories;