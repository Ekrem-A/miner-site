import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { validateEmail, checkRateLimit } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`login-${ip}`, 5, 300000)) {
      return NextResponse.json(
        { error: 'Çok fazla giriş denemesi. Lütfen 5 dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    const sanitizedEmail = email?.trim().toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Create Supabase client with cookie handling
    const cookieStore: Array<{ name: string; value: string; options?: any }> = [];
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach((cookie) => {
              cookieStore.push(cookie);
            });
          },
        },
      }
    );

    // Sign in
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (signInError) {
      console.error('Login error:', signInError);
      if (signInError.message.includes('Invalid login')) {
        return NextResponse.json(
          { error: 'E-posta veya şifre hatalı' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Giriş yapılırken bir hata oluştu' },
        { status: 500 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin, email, full_name, is_banned')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Check if user is banned
    if (profile?.is_banned) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'Hesabınız yasaklanmıştır' },
        { status: 403 }
      );
    }

    // Create response and set cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        isAdmin: profile?.is_admin || false,
        fullName: profile?.full_name,
      },
      redirectUrl: profile?.is_admin ? '/admin/dashboard' : '/account',
    });

    // Set all cookies with proper options
    console.log('Setting cookies:', cookieStore.length);
    cookieStore.forEach(({ name, value, options }) => {
      console.log('Setting cookie:', name);
      response.cookies.set(name, value, {
        ...options,
        httpOnly: false, // Allow JavaScript access for client-side Supabase
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: options?.maxAge || 60 * 60 * 24 * 7, // 7 days
      });
    });

    return response;

  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}