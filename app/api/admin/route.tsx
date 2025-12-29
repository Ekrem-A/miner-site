import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Helper function to check if user is admin
async function checkAdmin(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { isAdmin: false, user: null, supabase };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return { 
    isAdmin: profile?.is_admin === true, 
    user, 
    supabase 
  };
}

// GET - List all users
export async function GET(request: NextRequest) {
  try {
    const { isAdmin, supabase } = await checkAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, phone, address, city, postal_code, is_admin, created_at, is_banned, ban_reason, banned_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Kullanıcılar getirilemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: data || [] });

  } catch (error: any) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}