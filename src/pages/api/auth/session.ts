import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get('sb-access-token')?.value;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ authenticated: false, error: 'No access token' }),
        { status: 401 }
      );
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return new Response(
        JSON.stringify({ authenticated: false, error: error?.message || 'Invalid session' }),
        { status: 401 }
      );
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || 'user'
        }
      }),
      { status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ authenticated: false, error: 'Server error' }),
      { status: 500 }
    );
  }
};
