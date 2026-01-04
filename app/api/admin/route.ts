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

// POST - Update user
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, supabase } = await checkAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, action, data: updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    // Handle different actions
    if (action === 'update') {
      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
          { error: 'Kullanıcı güncellenemedi' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Kullanıcı güncellendi' 
      });
    }

    if (action === 'toggleAdmin') {
      const { data: currentUser } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

      const { error } = await supabase
        .from('user_profiles')
        .update({ is_admin: !currentUser?.is_admin })
        .eq('id', userId);

      if (error) {
        console.error('Error toggling admin:', error);
        return NextResponse.json(
          { error: 'Yetki güncellenemedi' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Yetki güncellendi' 
      });
    }

    if (action === 'ban') {
      const { reason } = body;
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_banned: true, 
          ban_reason: reason || 'Yönetici tarafından yasaklandı',
          banned_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error banning user:', error);
        return NextResponse.json(
          { error: 'Kullanıcı yasaklanamadı' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Kullanıcı yasaklandı' 
      });
    }

    if (action === 'unban') {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_banned: false, 
          ban_reason: null,
          banned_at: null
        })
        .eq('id', userId);

      if (error) {
        console.error('Error unbanning user:', error);
        return NextResponse.json(
          { error: 'Yasak kaldırılamadı' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Yasak kaldırıldı' 
      });
    }

    return NextResponse.json(
      { error: 'Geçersiz işlem' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Admin users POST API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { isAdmin, supabase } = await checkAdmin(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Kullanıcı ID gerekli' },
        { status: 400 }
      );
    }

    // Delete user profile
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: 'Kullanıcı silinemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Kullanıcı silindi' 
    });

  } catch (error: any) {
    console.error('Admin users DELETE API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}