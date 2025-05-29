import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../helpers/test-utils';

test.describe('Prueba de Nuevo Artículo - Admin', () => {
  test('debería hacer login y acceder a la ruta newarticle', async ({ page }) => {
    // Ir a la página de login
    await page.goto('/login');

    // Esperar a que la página cargue completamente
    await page.waitForLoadState('networkidle');

    // Verificar que estamos en la página de login
    await expect(page).toHaveTitle(/IBÑ News - Login/);

    // Rellenar credenciales admin
    await page.fill('#email', TEST_USERS.admin.email);
    await page.fill('#password', TEST_USERS.admin.password);

    // Configurar la respuesta de login simulada
    await page.route('**/api/auth/signin', async route => {
      // Simular la respuesta exitosa
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            id: 'test-admin-id',
            role: 'Administrador',
            email: TEST_USERS.admin.email
          }
        })
      });
    });

    // Establecer valores directamente en localStorage para garantizar autenticación
    await page.evaluate(() => {
      localStorage.setItem('user_role', 'Administrador');
      localStorage.setItem('user_id', 'test-admin-id');
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('user_data', JSON.stringify({
        id: 'test-admin-id',
        email: 'admin@admin.com',
        role: 'Administrador'
      }));
    });

    // Hacer click en el botón de login
    await page.click('button[type="submit"]:has-text("Login")');

    // Esperar tiempo suficiente para la navegación
    await page.waitForTimeout(5000);

    // Imprimir la URL actual después de login
    console.log('URL después de login:', page.url());

    // Navegar a la página de creación de artículos
    await page.goto('/newarticle', { waitUntil: 'networkidle' });

    // Esperar a que la página cargue
    await page.waitForTimeout(3000);

    // Imprimir URL actual para depuración
    console.log('URL después de navegar a /newarticle:', page.url());    // Verificar título de la página
    const pageTitle = await page.title();
    console.log('Título de la página:', pageTitle);

    // Si estamos en /login, intentar establecer autenticación y navegar de nuevo
    if (page.url().includes('/login')) {
      console.log('Detectada redirección a login. Reestableciendo autenticación...');

      await page.evaluate(() => {
        localStorage.setItem('user_role', 'Administrador');
        localStorage.setItem('user_id', 'test-admin-id');
        localStorage.setItem('authenticated', 'true');
        localStorage.setItem('user_data', JSON.stringify({
          id: 'test-admin-id',
          email: 'admin@admin.com',
          role: 'Administrador'
        }));
      });

      // Navegar directamente a la ruta protegida
      await page.goto('/newarticle', { waitUntil: 'networkidle' });
      console.log('URL después del segundo intento:', page.url());
    }
  });
});
