import { supabase } from "@/db/supabase";

export async function POST({ request }) {
    const formData = await request.formData();
    const title = formData.get("title");
    const body = formData.get("content");
    const categories = formData.getAll("categories[]");
    const imgurl = formData.get("imgurl");
    // You may want to get the article ID from a hidden input or the session
    const id = formData.get("id") || null;

    if (!id) {
        return new Response(JSON.stringify({ error: "ID de articulo no proporcionado." }), { status: 400 });
    }

    const { error: updateError } = await supabase
        .from("article")
        .update({ title, body, imgurl })
        .eq("id", id);

    if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
    }

    await supabase.from("articlecategories").delete().eq("article", id);

    if (categories.length > 0) {
        const newCategories = categories.map((catId) => ({
            article: id,
            category: catId,
        }));
        await supabase.from("articlecategories").insert(newCategories);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}