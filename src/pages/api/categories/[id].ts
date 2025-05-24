import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const { id } = params

    if (!id) {
      return new Response(JSON.stringify({ error: "ID de categoría requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Verificar si la categoría tiene artículos asociados
    const { data: associatedArticles } = await supabase
      .from("articlecategories")
      .select("article")
      .eq("category", Number.parseInt(id))

    if (associatedArticles && associatedArticles.length > 0) {
      return new Response(
        JSON.stringify({
          error: `No se puede eliminar la categoría porque tiene ${associatedArticles.length} artículo(s) asociado(s)`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Eliminar la categoría
    const { error } = await supabase.from("category").delete().eq("id", Number.parseInt(id))

    if (error) {
      console.error("Error deleting category:", error)
      return new Response(JSON.stringify({ error: "Error al eliminar la categoría" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("API Error:", error)
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
