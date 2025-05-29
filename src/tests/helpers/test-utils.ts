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
  console.log(`Attempting login for: ${email}`);

  await page.goto('/login');
  await page.waitForSelector('#email', { state: 'visible', timeout: 10000 });
  await page.waitForSelector('#password', { state: 'visible', timeout: 10000 });

  await page.fill('#email', email);
  await page.fill('#password', password);

  // Hacer click en el botón de login y esperar respuesta
  await page.click('button[type="submit"]:has-text("Login")');

  // Esperar a que se complete la navegación
  await page.waitForTimeout(3000);

  // Verificar que no estamos en la página de login (autenticación exitosa)
  await page.waitForFunction(() => !window.location.pathname.includes('/login'), { timeout: 10000 });

  console.log(`Login successful for: ${email}`);
}

/**
 * Función helper para realizar login como administrador de forma robusta
 * Esta función utiliza el formulario de login real para garantizar la autenticación
 * @param page Instancia de Page de Playwright
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const email = TEST_USERS.admin.email;
  const password = TEST_USERS.admin.password;

  console.log(`Logging in as admin: ${email}`);

  await performLogin(page, email, password);

  // Los admins deberían ser redirigidos a admin-control
  // Si no estamos ahí, navegar explícitamente
  if (!page.url().includes('/admin')) {
    await page.goto('/admin/admin-control');
  }

  // Verificar que tenemos acceso de admin
  if (page.url().includes('/login')) {
    throw new Error('Admin login failed - redirected to login page');
  }

  console.log('Admin login successful');
}

/**
 * Función helper para realizar login como redactor
 * @param page Instancia de Page de Playwright
 */
export async function loginAsWriter(page: Page): Promise<void> {
  const email = TEST_USERS.writer.email;
  const password = TEST_USERS.writer.password;

  console.log(`Logging in as writer: ${email}`);

  await performLogin(page, email, password);

  console.log('Writer login successful');
}

/**
 * Función helper para realizar login como lector
 * @param page Instancia de Page de Playwright
 */
export async function loginAsReader(page: Page): Promise<void> {
  const email = TEST_USERS.reader.email;
  const password = TEST_USERS.reader.password;

  console.log(`Logging in as reader: ${email}`);

  await performLogin(page, email, password);

  console.log('Reader login successful');
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
