import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categories = formData.getAll("categories[]");
  const user = formData.get("user_id") as string;
  const imgurl = formData.get("imgurl") as string;

  if (!title) return new Response("El Titulo de la noticia es obligatorio", { status: 400 });
  if (!content) return new Response("El Contenido de la noticia es obligatorio", { status: 400 });
  if (!categories) return new Response("Hay que poner al menos, una categoría a la noticia", { status: 400 });
  if (!user) return new Response("Usuario no encontrado", { status: 400 });
  if (!imgurl) return new Response("La URL de la imagen es obligatoria", { status: 400 });

  const { data: lastArticleID } = await supabase
    .from("article")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .single();

  const newArticleID = lastArticleID ? lastArticleID.id + 1 : 1;

  const { error: articleError } = await supabase
    .from("article")
    .insert([
      {
        id: newArticleID,
        title,
        body: content,
        timestamp: new Date().toISOString(),
        author: user,
        imgurl: imgurl,
      },
    ]);

  if (articleError) {
    console.error("Error insertando articulos:", articleError);
    return new Response("Error al insertar la noticia", { status: 500 });
  }

  const { error: categoryError } = await supabase
    .from("articlecategories")
    .insert(
      categories.map((category) => ({
        article: newArticleID,
        category: Number(category),
      }))
    );

  if (categoryError) {
    console.error("Error insertando categorias:", categoryError);
    return new Response("Error al insertar las categorías", { status: 500 });
  }

  return new Response("Noticia creada correctamente", { status: 200 });
}