import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../database.types";

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.PUBLIC_SUPABASE_SERVICE_KEY!;

// Cliente con privilegios de servicio para crear usuarios
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TEST_USERS = [
  {
    email: 'admin@admin.com',
    password: 'admin',
    role: 'Administrador'
  },
  {
    email: 'redactorcuatro@acme.com',
    password: 'redactor',
    role: 'Redactor'
  },
  {
    email: 'redactorvacio@acme.com',
    password: 'redactor',
    role: 'Lector'
  }
];

export async function setupTestUsers() {
  console.log('Configurando usuarios de test en Supabase...');

  for (const user of TEST_USERS) {
    try {
      // Intentar crear el usuario
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          role: user.role
        }
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`Usuario ${user.email} ya existe`);
        } else {
          console.error(`Error creando usuario ${user.email}:`, error.message);
        }
      } else {
        console.log(`Usuario ${user.email} creado exitosamente con rol ${user.role}`);
      }
    } catch (err) {
      console.error(`Error inesperado creando usuario ${user.email}:`, err);
    }
  }

  console.log('Configuración de usuarios de test completada');
}

// Función para verificar si un usuario existe y puede autenticarse
export async function verifyTestUser(email: string, password: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error(`Error verificando usuario ${email}:`, error.message);
      return false;
    }

    console.log(`Usuario ${email} verificado exitosamente`);
    return true;
  } catch (err) {
    console.error(`Error inesperado verificando usuario ${email}:`, err);
    return false;
  }
}

// Ejecutar si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTestUsers().then(() => {
    console.log('Script de configuración completado');
    process.exit(0);
  }).catch((err) => {
    console.error('Error en script de configuración:', err);
    process.exit(1);
  });
}
