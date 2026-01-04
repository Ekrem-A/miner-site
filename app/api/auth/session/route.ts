import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Get project ref from URL
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] || 'default';
    
    // Try to get auth token from cookie
    const authCookie = request.cookies.get(`sb-${projectRef}-auth-token`)?.value;
    const accessToken = request.cookies.get('sb-access-token')?.value;
    
    console.log('Session API - Project Ref:', projectRef);
    console.log('Session API - Auth Cookie exists:', !!authCookie);
    console.log('Session API - Access Token exists:', !!accessToken);

    // Kullanıcı oturumu için normal client
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

    // RLS'yi bypass etmek için service role client
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Try to get user from session
    let user = null;
    
    // First try standard getUser
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (!userError && userData?.user) {
      user = userData.user;
    } else if (accessToken) {
      // Try to get user from access token directly
      const { data: tokenUser, error: tokenError } = await adminSupabase.auth.getUser(accessToken);
      if (!tokenError && tokenUser?.user) {
        user = tokenUser.user;
      }
    } else if (authCookie) {
      // Try to parse auth cookie
      try {
        const authData = JSON.parse(authCookie);
        if (authData.access_token) {
          const { data: cookieUser, error: cookieError } = await adminSupabase.auth.getUser(authData.access_token);
          if (!cookieError && cookieUser?.user) {
            user = cookieUser.user;
          }
        }
      } catch (e) {
        console.log('Session API - Could not parse auth cookie');
      }
    }

    if (!user) {
      console.log('Session API - No user found');
      return NextResponse.json(
        { user: null, isAuthenticated: false },
        { status: 200 }
      );
    }

    console.log('Session API - User ID:', user.id);

    // Get user profile with admin client (bypasses RLS)
    const { data: profile, error: profileError } = await adminSupabase
      .from('user_profiles')
      .select('is_admin, full_name, is_banned')
      .eq('id', user.id)
      .single();

    console.log('Session API - Profile:', profile);
    console.log('Session API - Profile Error:', profileError);

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