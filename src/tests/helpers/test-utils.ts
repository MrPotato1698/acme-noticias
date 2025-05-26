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
 * Función helper para realizar login como administrador
 * Esta función es más directa para evitar problemas de timeout
 * @param page Instancia de Page de Playwright
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  // Navegamos a la página principal
  await page.goto('/');
  
  const email = TEST_USERS.admin.email;
  
  // Establecemos el estado de autenticación directamente
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
  
  // Configurar cookies para autenticación
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
  
  // Refrescamos la página para aplicar los cambios
  await page.reload();
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
