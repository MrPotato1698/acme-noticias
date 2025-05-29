import { supabase } from "@/db/supabase";

export async function fetchCategories() {
    const { data, error } = await supabase.from("category").select("*");
    if (error) throw error;
    return data;
}
