import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase-proxy';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

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

  // RLS bypass için admin client
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Login sayfasında zaten giriş yapmış admin varsa dashboard'a yönlendir
  if (pathname === '/login' && user) {
    const { data: profile } = await adminSupabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profile?.is_admin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // Admin route'ları koru
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin yetkisi kontrolü - service role ile RLS bypass
    const { data: profile } = await adminSupabase
      .from('user_profiles')
      .select('is_admin, is_banned')
      .eq('id', user.id)
      .single();

    if (profile?.is_banned) {
      return NextResponse.redirect(new URL('/login?error=banned', request.url));
    }

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return supabaseResponse;
}

// Matcher configuration - hangi route'larda proxy çalışacak
export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/register',
  ],
};