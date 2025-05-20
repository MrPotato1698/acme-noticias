import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { data: deletedArticle, error: errorDeleteData } = await supabase
    .from('article')
    .delete()
    .eq('id', id)
    .select();

  // Extraer el nombre del archivo de la URL de la imagen
  const img = deletedArticle?.[0]?.imgurl?.split("/").pop();

  // Eliminar la imagen del storage si existe
  if (img) {
    const { error: errorRemoveImg } = await supabase.storage
      .from('articleimg')
      .remove([img]);

    if (errorRemoveImg) {
      console.error("Error al eliminar la imagen del articulo:", errorRemoveImg);
      return new Response("Error al eliminar la imagen del articulo", { status: 500 });
    }
  }

  if (errorDeleteData) {
    console.error("Error al eliminar el coche:", errorDeleteData);
    return new Response("Error al eliminar el coche", { status: 500 });
  }
  return new Response("Coche eliminada con exito", { status: 200 });
}
