import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const images = formData.getAll("images");
  const imageFile = images[0];

  if (!(imageFile instanceof File)) {
    return new Response(JSON.stringify({ error: "No se recibió una imagen válida" }), { status: 400 });
  }
  const originalName = imageFile.name;

  // Subir la imagen al bucket
  const { error } = await supabase.storage
    .from("articleimg")
    .upload(originalName, imageFile, {
      cacheControl: "3600",
      upsert: true,
      contentType: imageFile.type ?? "image/webp",
    });

  if (error) {
    return new Response(JSON.stringify({ error: "Error al subir la imagen" }), { status: 500 });
  }
  // Obtener la URL pública
  const { data: urlData } = supabase.storage.from("articleimg").getPublicUrl(originalName);
  if (!urlData?.publicUrl) {
    return new Response(JSON.stringify({ error: "No se pudo obtener la URL pública" }), { status: 500 });
  }

  return new Response(JSON.stringify({ publicUrl: urlData.publicUrl, name: originalName }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
