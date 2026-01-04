import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export type SiteSettings = {
  id: string;
  site_name: string;
  site_description: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_city: string | null;
  business_hours: string | null;
  tax_office: string | null;
  tax_number: string | null;
  mersis_number: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  social_linkedin: string | null;
  created_at: string;
  updated_at: string;
};

// GET - Site ayarlarını getir
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .single();

    if (error) {
      // Eğer veri yoksa default değerler döndür
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          site_name: 'Han Bilişim',
          site_description: 'ASIC Miner Çözümleri',
          contact_email: null,
          contact_phone: null,
          contact_address: null,
          contact_city: null,
          business_hours: null,
          tax_office: null,
          tax_number: null,
          mersis_number: null,
          social_facebook: null,
          social_instagram: null,
          social_twitter: null,
          social_linkedin: null,
        });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Site settings fetch error:', error);
    return NextResponse.json(
      { error: 'Site ayarları alınamadı' },
      { status: 500 }
    );
  }
}

// PUT - Site ayarlarını güncelle
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Mevcut kaydı kontrol et
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .single();

    let result;
    
    if (existing) {
      // Güncelle
      result = await supabase
        .from('site_settings')
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Yeni kayıt oluştur
      result = await supabase
        .from('site_settings')
        .insert({
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Site settings update error:', error);
    return NextResponse.json(
      { error: 'Site ayarları güncellenemedi' },
      { status: 500 }
    );
  }
}
