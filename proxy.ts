import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase-proxy';
import { createServerClient } from '@supabase/ssr';

// Next.js 16+ Proxy function (eski adı: middleware)
export async function proxy(request: NextRequest) {
  // Session güncelleme
  let supabaseResponse = await updateSession(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Admin route'ları koru
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin yetkisi kontrolü
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin, is_banned')
      .eq('id', user.id)
      .single();

    if (profile?.is_banned) {
      return NextResponse.redirect(new URL('/login?error=banned', request.url));
    }

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/account', request.url));
    }
  }

  // Account route'larını koru
  if (pathname.startsWith('/account')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Ban kontrolü
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_banned')
      .eq('id', user.id)
      .single();

    if (profile?.is_banned) {
      return NextResponse.redirect(new URL('/login?error=banned', request.url));
    }
  }

  // Login/Register sayfalarına giriş yapmış kullanıcılar erişemesin
  if ((pathname === '/login' || pathname === '/register') && user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profile?.is_admin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/account', request.url));
  }

  return supabaseResponse;
}

// Matcher configuration - hangi route'larda proxy çalışacak
export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/login',
    '/register',
  ],
};