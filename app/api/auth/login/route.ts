import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
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

    // Create response object first to set cookies on it
    const response = NextResponse.json({ success: false });
    
    // Create Supabase client with proper cookie handling
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              });
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

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Admin client to bypass RLS
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile
    const { data: profile, error: profileError } = await adminSupabase
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

    // Manually set auth cookies from session
    const accessToken = data.session.access_token;
    const refreshToken = data.session.refresh_token;
    const expiresAt = data.session.expires_at;
    
    // Set Supabase auth cookies manually
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    // Main auth token cookie
    response.cookies.set('sb-access-token', accessToken, cookieOptions);
    response.cookies.set('sb-refresh-token', refreshToken, cookieOptions);
    
    // Also set the standard Supabase cookie format
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] || 'default';
    response.cookies.set(`sb-${projectRef}-auth-token`, JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      token_type: 'bearer',
      user: data.user,
    }), cookieOptions);

    console.log('Login successful, cookies set for user:', data.user.id);
    console.log('Profile:', profile);
    console.log('Is Admin:', profile?.is_admin);
    console.log('Redirect URL:', profile?.is_admin ? '/admin/dashboard' : '/');

    // Update the response body with success data
    const successResponse = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        isAdmin: profile?.is_admin || false,        
      },
      redirectUrl: profile?.is_admin ? '/admin/dashboard' : '/',
    });

    // Copy all cookies from the original response
    response.cookies.getAll().forEach(cookie => {
      successResponse.cookies.set(cookie.name, cookie.value);
    });

    return successResponse;

  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}