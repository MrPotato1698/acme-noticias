import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { access_token, new_password } = await request.json();

  if (!access_token) {
    return new Response(
      JSON.stringify({ error: 'Token no proporcionado' }),
      { status: 400 }
    );
  }

  try {
    // Establecer la sesión con el token
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token: access_token,
    });

    if (sessionError) throw sessionError;

    // Actualizar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password
    });

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar contraseña' }),
      { status: 500 }
    );
  }
};