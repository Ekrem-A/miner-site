import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
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

    await supabase.auth.signOut();

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Çıkış yapıldı',
    });

    // Get all cookies from request to delete them
    const allCookies = request.cookies.getAll();
    
    // Delete all cookies
    allCookies.forEach(({ name }) => {
      response.cookies.delete({
        name,
        path: '/',
      });
    });

    // Delete all auth cookies from cookieStore
    cookieStore.forEach(({ name }) => {
      response.cookies.delete({
        name,
        path: '/',
      });
    });

    // Explicitly delete all possible Supabase cookie variations
    const supabaseCookiePatterns = [
      'sb-access-token',
      'sb-refresh-token',
      'sb-auth-token',
      'supabase-auth-token',
      'supabase.auth.token',
    ];

    // Get the project ref from URL to construct actual cookie names
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
    
    if (projectRef) {
      // Add project-specific cookie names
      supabaseCookiePatterns.push(
        `sb-${projectRef}-auth-token`,
        `sb-${projectRef}-auth-token.0`,
        `sb-${projectRef}-auth-token.1`
      );
    }

    supabaseCookiePatterns.forEach((name) => {
      response.cookies.delete({
        name,
        path: '/',
      });
      response.cookies.set(name, '', {
        maxAge: 0,
        path: '/',
        expires: new Date(0),
      });
    });

    return response;

  } catch (error: any) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}