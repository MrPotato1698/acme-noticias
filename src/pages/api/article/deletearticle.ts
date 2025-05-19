import type { APIRoute } from "astro";
import { supabase } from "@/db/supabase";

export const POST: APIRoute = async ({ request }) => {
    console.log("TEST: ");

    const { articleId } = await request.json();

    if (!articleId) {
        return new Response("Article ID is required", { status: 400 });
    }

    console.log("id given: ", articleId);

    const { error } = await supabase
        .from("article")
        .delete()
        .eq("id", articleId);

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    return new Response("Article deleted successfully", { status: 200 });
};