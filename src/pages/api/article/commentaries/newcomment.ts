import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

/**
 * Encuentra el siguiente ID disponible para un comentario.
 */
async function getNextCommentId() {
  const { data: getLastComment } = await supabase
    .from('commentary')
    .select('id')
    .order('id', { ascending: true });

  if (!getLastComment) throw new Error("Error al obtener el último ID de comentario");
  let findID = false;
  let i = 1;
  while (!findID && i < getLastComment.length) {
    if (getLastComment[i - 1].id === i) {
      i++;
    } else {
      findID = true;
    }
  }
  if (!findID) i++;
  return getLastComment ? i : 1;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { article, comment } = body

    // Validar datos
    if (!article || !comment) {
      return new Response(JSON.stringify({ error: "Faltan datos requeridos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validar longitud del comentario
    if (comment.length > 500) {
      return new Response(JSON.stringify({ error: "El comentario excede los 500 caracteres" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Obtener sesión del usuario desde las cookies
    const accessToken = cookies.get("sb-access-token")?.value
    const refreshToken = cookies.get("sb-refresh-token")?.value
    let userId = null

    if (accessToken && refreshToken) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (!authError && user) {
        userId = user.id
      }
    }

    // Obtener el siguiente ID disponible para el comentario
    const lastCommentID = await getNextCommentId();

    // Insertar comentario
    const { data, error } = await supabase
      .from("commentary")
      .insert({
        id: lastCommentID,
        article: Number.parseInt(article),
        comment: comment.trim(),
        redactor: userId,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error insertando comentario:", error)
      return new Response(JSON.stringify({ error: "Error al guardar el comentario" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true, data }), {
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
