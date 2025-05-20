import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = typeof emailValue === "string" ? emailValue : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!email || !password) {
    return new Response(
      JSON.stringify({ error: "Correo electrónico y contraseña obligatorios" }),
      { status: 400 }
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(
      JSON.stringify({ error: "Credenciales incorrectas" }),
      { status: 401 }
    );
  }

  const { access_token, refresh_token } = data.session;
  cookies.set("sb-access-token", access_token, { path: "/" });
  cookies.set("sb-refresh-token", refresh_token, { path: "/" });

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200 }
  );
};