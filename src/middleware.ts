import { defineMiddleware } from 'astro:middleware';
import { supabase } from './db/supabase';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, redirect, cookies } = context;
  const url = new URL(request.url);

  // Solo aplicar middleware a rutas admin
  if (url.pathname.startsWith('/admin')) {
    try {
      // Obtener tokens de las cookies
      const accessToken = cookies.get('sb-access-token')?.value;
      const refreshToken = cookies.get('sb-refresh-token')?.value;

      if (!accessToken) {
        console.log('No access token found, redirecting to login');
        return redirect('/login');
      }

      // Verificar la sesión con Supabase
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);

      if (error || !user) {
        console.log('Invalid session, redirecting to login:', error?.message);
        // Limpiar cookies inválidas
        cookies.delete('sb-access-token', { path: '/' });
        cookies.delete('sb-refresh-token', { path: '/' });
        return redirect('/login');
      }

      // Usuario válido, continuar
      console.log('Valid user session for:', user.email);

    } catch (error) {
      console.error('Middleware error:', error);
      return redirect('/login');
    }
  }

  // Continuar con la siguiente función
  return next();
});
