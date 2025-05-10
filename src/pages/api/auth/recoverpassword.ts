import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  if (!email) {
    return new Response(
      JSON.stringify({ message: "Email no proporcionado" }),
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/modpassword`,
    });

    if (error) {
      return new Response(
        JSON.stringify({ message: error.message }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in recoverpassword API:", error);
    return new Response(
      JSON.stringify({ message: "Error interno del servidor" }),
      { status: 500 }
    );
  }
};