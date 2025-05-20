import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
  const { id } = await request.json();
  if (!id) {
    return new Response("Id is required", { status: 400 });
  }
  const { data: deletedCommentary, error: errorDeleteData } = await supabase
    .from('commentary')
    .delete()
    .eq('id', id);

  if (errorDeleteData) {
    console.error("Error al eliminar el comentario:", errorDeleteData);
    return new Response("Error al eliminar el comentario", { status: 500 });
  }
  return new Response("Comentario eliminado con exito", { status: 200 });
}
