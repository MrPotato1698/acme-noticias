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

  /*const { data: deletedArticle, error: errorDeleteData } = await supabase
    .from('article')
    .select('*')
    .eq('id', id);*/

  // Extraer el nombre del archivo de la URL de la imagen
  const img = deletedArticle?.[0]?.imgurl?.split("/").pop();
  const imgWithSlash = img ? `/${img}` : null;

  // Eliminar la imagen del storage si existe
  if (imgWithSlash) {
    console.log("URL Original:", deletedArticle?.[0]?.imgurl);
    console.log("Eliminando imagen:", imgWithSlash);
    const { error: errorRemoveImg } = await supabase
      .storage
      .from('articleimg')
      .remove([imgWithSlash]);
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
