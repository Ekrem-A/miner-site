import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { user: null, isAuthenticated: false },
        { status: 200 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin, full_name, is_banned')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        isAdmin: profile?.is_admin || false,
        fullName: profile?.full_name,
        isBanned: profile?.is_banned || false,
      },
      isAuthenticated: true,
    });

  } catch (error: any) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { user: null, isAuthenticated: false },
      { status: 200 }
    );
  }
}