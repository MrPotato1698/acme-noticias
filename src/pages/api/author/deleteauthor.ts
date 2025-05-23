import type { APIRoute } from "astro";
import { supabaseAdmin } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    return new Response("Error al eliminar el perfil: " + error.message , { status: 500 });
  }
  return new Response("Perfil eliminada con exito", { status: 200 });
}