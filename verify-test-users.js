import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente con privilegios de servicio para crear usuarios
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TEST_USERS = [
  {
    email: "admin@admin.com",
    password: "admin",
    role: "Administrador",
  },
  {
    email: "redactorcuatro@acme.com",
    password: "redactor",
    role: "Redactor",
  },
  {
    email: "redactorvacio@acme.com",
    password: "redactor",
    role: "Lector",
  },
];

async function verifyTestUsers() {
  console.log("Verificando usuarios de test...");

  for (const user of TEST_USERS) {
    try {
      console.log(`Verificando usuario: ${user.email}`);

      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      if (error) {
        console.error(
          `❌ Usuario ${user.email} no puede autenticarse:`,
          error.message
        );
      } else {
        console.log(`✅ Usuario ${user.email} autenticado exitosamente`);
        console.log(`   ID: ${data.user.id}`);
        console.log(`   Metadata:`, data.user.user_metadata);
      }

      // Cerrar sesión
      await supabaseAdmin.auth.signOut();
    } catch (err) {
      console.error(
        `❌ Error inesperado verificando usuario ${user.email}:`,
        err
      );
    }
  }

  console.log("Verificación completada");
}

verifyTestUsers()
  .then(() => {
    console.log("Script completado");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error en script:", err);
    process.exit(1);
  });
