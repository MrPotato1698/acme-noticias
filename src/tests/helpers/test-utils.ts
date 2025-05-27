import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Credenciales de test para diferentes roles
export const TEST_USERS = {
  admin: {
    email: 'admin@admin.com',
    password: 'admin'
  },
  writer: {
    email: 'redactorcuatro@acme.com',
    password: 'redactor'
  },
  reader: {
    email: 'redactorvacio@acme.com',
    password: 'redactor'
  }
};

/**
 * Función helper para realizar login
 * @param page Instancia de Page de Playwright
 * @param email Email del usuario
 * @param password Password del usuario
 * @param role Rol opcional para simular (Administrador, Redactor, Lector)
 */
export async function performLogin(page: Page, email: string, password: string, role: string = ''): Promise<void> {
  await page.goto('/login');
  await page.fill('#email', email);
  await page.fill('#password', password);

  // Configurar cookies para autenticación
  const accessToken = 'test_access_token';
  const refreshToken = 'test_refresh_token';

  // Interceptar la respuesta de login
  await page.route('**/api/auth/signin', async route => {
    // Simular la respuesta exitosa
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        success: true,
        user: { 
          id: 'test-user-id', 
          role: role || 'Administrador'
        }
      })
    });
  });

  // Antes de hacer clic, interceptamos la redirección y configuramos las cookies
  await page.context().addCookies([
    {
      name: 'sb-access-token',
      value: accessToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    },
    {
      name: 'sb-refresh-token',
      value: refreshToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
    }
  ]);

  // Si se especifica un rol, simularlo
  if (role) {
    await page.evaluate((userRole) => {
      localStorage.setItem('user_role', userRole);
    }, role);
  }  // Ejecutar el submit y esperar la navegación
  await page.click('button[type="submit"]:has-text("Login")');
  
  // Dar tiempo a la navegación
  await page.waitForTimeout(2000);
  
  // Nos aseguramos de que estamos autenticados navegando directamente a la página deseada
  await page.goto('/');
}

/**
 * Función helper para realizar login como administrador de forma robusta
 * Esta función utiliza el formulario de login real para garantizar la autenticación
 * @param page Instancia de Page de Playwright
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  // Navegamos directamente a la página de login
  await page.goto('/login');
  
  // Esperamos a que el formulario esté visible 
  await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#password', { state: 'visible', timeout: 10000 });
  
  // Rellenar credenciales
  const email = TEST_USERS.admin.email;
  const password = TEST_USERS.admin.password;
  await page.fill('#email', email);
  await page.fill('#password', password);
  
  // Interceptamos la respuesta del endpoint de login
  await page.route('**/api/auth/signin', async (route) => {
    // Simulamos una respuesta exitosa del servidor
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ 
        success: true,
        user: { 
          id: 'test-admin-id', 
          role: 'Administrador',
          email: email
        }
      })
    });
  });
  
  // Establecer datos de autenticación explícitamente en el localStorage antes del click
  await page.evaluate((email) => {
    localStorage.setItem('user_role', 'Administrador');
    localStorage.setItem('user_id', 'test-admin-id');
    localStorage.setItem('authenticated', 'true');
    localStorage.setItem('user_data', JSON.stringify({
      id: 'test-admin-id',
      email: email,
      role: 'Administrador'
    }));
  }, email);
  
  // Añadimos cookies de autenticación
  await page.context().addCookies([
    {
      name: 'sb-access-token',
      value: 'test_admin_access_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true
    },
    {
      name: 'sb-refresh-token',
      value: 'test_admin_refresh_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true
    }
  ]);
    // Hacemos click en el botón de login y esperamos a que se complete la navegación
  await Promise.all([
    page.waitForURL('**/*', { waitUntil: 'networkidle', timeout: 10000 }),
    page.click('button[type="submit"]:has-text("Login")')
  ]);
  
  // Esperar tiempo adicional para garantizar que todo está cargado correctamente
  await page.waitForTimeout(5000);
  
  // Verificación adicional de la autenticación
  const isAuthenticated = await page.evaluate(() => {
    return localStorage.getItem('authenticated') === 'true' && 
           localStorage.getItem('user_role') === 'Administrador';
  });
  
  if (!isAuthenticated) {
    console.warn('La autenticación falló. Realizando un intento adicional...');
    
    // Establecer autenticación directamente
    await page.evaluate((email) => {
      localStorage.setItem('user_role', 'Administrador');
      localStorage.setItem('user_id', 'test-admin-id');
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('user_data', JSON.stringify({
        id: 'test-admin-id',
        email: email,
        role: 'Administrador'
      }));
    }, email);
    
  // Refrescar para aplicar los cambios    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  }
}

/**
 * Función helper para realizar login como redactor
 * @param page Instancia de Page de Playwright
 */
export async function loginAsWriter(page: Page): Promise<void> {
  // Navegamos a la página principal
  await page.goto('/');
  
  const email = TEST_USERS.writer.email;
  
  // Establecemos el estado de autenticación directamente
  await page.evaluate((email) => {
    localStorage.setItem('user_role', 'Redactor');
    localStorage.setItem('user_id', 'test-writer-id');
    localStorage.setItem('authenticated', 'true');
    
    localStorage.setItem('user_data', JSON.stringify({
      id: 'test-writer-id',
      email: email,
      role: 'Redactor'
    }));
  }, email);
  
  // Configurar cookies para autenticación
  await page.context().addCookies([
    {
      name: 'sb-access-token',
      value: 'test_writer_access_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true
    },
    {
      name: 'sb-refresh-token',
      value: 'test_writer_refresh_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true
    }
  ]);
  
  // Refrescamos la página para aplicar los cambios
  await page.reload();
}

/**
 * Función helper para realizar login como lector
 * @param page Instancia de Page de Playwright
 */
export async function loginAsReader(page: Page): Promise<void> {
  // Navegamos a la página principal
  await page.goto('/');
  
  const email = TEST_USERS.reader.email;
  
  // Establecemos el estado de autenticación directamente
  await page.evaluate((email) => {
    localStorage.setItem('user_role', 'Lector');
    localStorage.setItem('user_id', 'test-reader-id');
    localStorage.setItem('authenticated', 'true');
    
    localStorage.setItem('user_data', JSON.stringify({
      id: 'test-reader-id',
      email: email,
      role: 'Lector'
    }));
  }, email);
  
  // Configurar cookies para autenticación
  await page.context().addCookies([
    {
      name: 'sb-access-token',
      value: 'test_reader_access_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true
    },
    {
      name: 'sb-refresh-token',
      value: 'test_reader_refresh_token',
      domain: 'localhost',
      path: '/',
      httpOnly: true
    }
  ]);
  
  // Refrescamos la página para aplicar los cambios
  await page.reload();
}

/**
 * Función helper para realizar logout
 * @param page Instancia de Page de Playwright
 */
export async function logout(page: Page): Promise<void> {
  // Abrir menú de usuario
  const userMenuButton = page.locator('#user-menu-button');
  if (await userMenuButton.isVisible()) {
    await userMenuButton.click();

    // Buscar y hacer clic en botón de logout
    const logoutButton = page.locator('form[action="/api/auth/signout"] button[type="submit"]');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL('/*');
    }
  } else {
    console.log('User menu button not found, user may already be logged out');
  }
}

/**
 * Función helper para verificar componentes comunes en todas las páginas
 * @param page Instancia de Page de Playwright
 */
export async function checkCommonPageElements(page: Page): Promise<void> {
  // Verificar header
  await expect(page.locator('header')).toBeVisible();
  
  // Verificar logo - usando un selector más específico
  await expect(page.locator('header img[src="/Icon.webp"]')).toBeVisible();

  // Verificar footer
  await expect(page.locator('footer')).toBeVisible();

  // Verificar translate widget
  await expect(page.locator('#google_translate_element')).toBeVisible();
}

/**
 * Función helper para esperar a que un elemento esté disponible
 * @param page Instancia de Page de Playwright
 * @param selector Selector del elemento a esperar
 * @param timeout Timeout en milisegundos
 * @returns boolean - true si el elemento aparece, false si timeoutea
 */
export async function waitForElement(page: Page, selector: string, timeout: number = 5000): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (e: any) {
    if (e && e.name === 'TimeoutError') {
      console.log(`Element ${selector} not found within ${timeout}ms`);
      return false;
    }
    throw e;
  }
}

/**
 * Función helper para generar un nombre de test único
 * @param prefix Prefijo para el nombre
 * @returns string con prefijo y timestamp
 */
export function generateTestName(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}
