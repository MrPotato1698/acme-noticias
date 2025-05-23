import { createClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.PUBLIC_SUPABASE_SERVICE_KEY

if (!supabaseUrl) {
  throw new Error('Falta la URL  de Supabase')
}

if (!supabaseAnonKey) {
  throw new Error('Falta la clave anónima de Supabase')
}

if (!supabaseServiceKey) {
  throw new Error('Falta la clave de servicio de Supabase')
}


export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    db:{
      schema: 'public',
    },
    // auth: {
    //   autoRefreshToken: false,
    //   persistSession: false,
    //   detectSessionInUrl: false
    // }
  }
);

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    db:{
      schema: 'public',
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);