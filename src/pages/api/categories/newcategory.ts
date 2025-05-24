import type { APIRoute } from "astro"
import { supabase } from "@/db/supabase"

async function getNextId() {
  const { data: getLastCategory } = await supabase
    .from('category')
    .select('id')
    .order('id', { ascending: true });

  console.log("Últimas categorías:", getLastCategory);
  console.log("Cantidad de categorías:", getLastCategory?.length);

  if (!getLastCategory) throw new Error("Error al obtener el último ID de categoria");
  let findID = false;
  let i = 1;
  while (!findID && i < getLastCategory.length) {
    if (getLastCategory[i-1].id === (i-1)) {
      i++;
    } else {
      findID = true;
    }
  }
  if (!findID) i++;
  return getLastCategory ? i : 1;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { name, description } = body

    // Validar datos
    if (!name || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: "El nombre de la categoría es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Verificar si la categoría ya existe
    const { data: existingCategory } = await supabase.from("category").select("id").eq("name", name.trim()).single()

    if (existingCategory) {
      return new Response(JSON.stringify({ error: "Ya existe una categoría con ese nombre" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Obtener el siguiente ID disponible para el comentario
    const lastCategoryID = await getNextId();

    console.log("Nuevo ID de categoría:", lastCategoryID)

    // Insertar nueva categoría
    const { data, error } = await supabase
      .from("category")
      .insert({
        id: lastCategoryID,
        name: name.trim(),
        description: description?.trim() ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting category:", error)
      return new Response(JSON.stringify({ error: "Error al crear la categoría" }), {
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
