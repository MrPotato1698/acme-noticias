import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();

  const nombre = formData.get("nombre") as string;
  const id = formData.get("id") as string;

  if (!nombre) return new Response("El nombre del redactor es obligatorio", { status: 400 });
  if (!id) return new Response("El id del perfil es obligatorio", { status: 400 });

  const { error } = await supabase
  .from("profiles")
  .update({"full_name": nombre,})
  .eq("id", id);

  if (error) {
    console.error("Error actualizando el redactor: ", error);
    return new Response("Error al actualizar el redactor: " + (error.message || JSON.stringify(error)), { status: 500 });
  }

  return new Response("Noticia creada correctamente", { status: 200 });
}

