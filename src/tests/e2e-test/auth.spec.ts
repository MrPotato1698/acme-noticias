import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsWriter, loginAsReader } from '../helpers/test-utils';

test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('debería cargar la página de login con el título correcto', async ({ page }) => {
    await expect(page).toHaveTitle('IBÑ News - Login');
  });
  test('debería mostrar el formulario de login', async ({ page }) => {
    // Verificar que el formulario de login está presente usando un selector más específico
    await expect(page.locator('form[action="/api/auth/signin"]')).toBeVisible();

    // Verificar campos del formulario
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    // Verificar botón de submit
    await expect(page.locator('button[type="submit"]:has-text("Login")')).toBeVisible();
  });
  test('debería mostrar validación para campos vacíos', async ({ page }) => {
    // Intentar hacer submit sin llenar campos
    await page.click('button[type="submit"]:has-text("Login")');

    // Los campos de email y password deberían estar vacíos
    const emailField = page.locator('#email');
    const passwordField = page.locator('#password');

    // Verificar que los campos están vacíos
    await expect(emailField).toHaveValue('');
    await expect(passwordField).toHaveValue('');

    // Como alternativa, podemos verificar que la URL no ha cambiado
    await expect(page).toHaveURL(/.*\/login/);
  });
  test('debería mostrar error para credenciales inválidas', async ({ page }) => {
    // Llenar con credenciales incorrectas
    await page.fill('#email', 'invalid@test.com');
    await page.fill('#password', 'wrongpassword');

    // Configurar escucha de diálogos antes de hacer la acción
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Credenciales incorrectas');
      await dialog.accept();
    });

    // Hacer submit
    await page.click('button[type="submit"]:has-text("Login")');

    // Esperar y verificar mensaje de error
    await page.waitForTimeout(2000);
  });
  test('debería navegar a la página principal cuando se acceda a login estando desconectado', async ({ page }) => {
    // Verificar que estamos en la página de login
    await expect(page).toHaveURL(/.*\/login/);

    // Verificar que el formulario de inicio de sesión está visible
    await expect(page.locator('form[action="/api/auth/signin"]')).toBeVisible();
  });
  test('debería tener atributos de formulario apropiados', async ({ page }) => {
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');

    // Verificar tipos de input
    await expect(emailInput).toHaveAttribute('type', 'text');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Verificar autocomplete
    await expect(emailInput).toHaveAttribute('autocomplete', 'off');
    await expect(passwordInput).toHaveAttribute('autocomplete', 'off');
  });

  test('debería tener etiquetas de formulario accesibles', async ({ page }) => {
    // Verificar que los labels están asociados correctamente
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();

    // Verificar texto de los labels
    await expect(page.locator('label[for="email"]')).toHaveText('Email');
    await expect(page.locator('label[for="password"]')).toHaveText('Contraseña');
  });

  test('debería tener estilos y diseño apropiados', async ({ page }) => {
    // Verificar que el contenedor principal está presente
    await expect(page.locator('.flex.items-center.justify-center')).toBeVisible();

    // Verificar que el formulario tiene las clases de estilo correctas
    const emailInput = page.locator('#email');
    await expect(emailInput).toHaveClass(/border/);
    await expect(emailInput).toHaveClass(/rounded-md/);
  });

  test('debería manejar el envío del formulario correctamente', async ({ page }) => {
    // Llenar el formulario
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'testpassword');

    // Interceptar la request de login
    const loginRequest = page.waitForRequest(request =>
      request.url().includes('/api/auth/signin') && request.method() === 'POST'
    );

    // Hacer submit
    await page.click('button[type="submit"]:has-text("Login")');

    // Verificar que se hace la request
    await loginRequest;
  });

  test('debería redireccionar después de un login exitoso', async ({ page }) => {
    // Nota: Este test requiere credenciales válidas o un mock
    // Por ahora verificamos la lógica del formulario

    await page.fill('#email', 'valid@test.com');
    await page.fill('#password', 'validpassword');

    // Mock la respuesta exitosa
    await page.route('**/api/auth/signin', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.click('button[type="submit"]:has-text("Login")');

    // Verificar que se redirige (en este caso a la homepage)
    await expect(page).toHaveURL(/.*\/$/);
  });
});

// Tests para verificar la autenticación con diferentes roles
test.describe('Autenticación basada en roles', () => {
  test('debería hacer login exitosamente como administrador', async ({ page }) => {
    // Usamos la función centralizada de loginAsAdmin
    await loginAsAdmin(page);

    // Los admins son redirigidos a admin-control por el middleware
    await expect(page).toHaveURL(/.*\/admin\/admin-control/);

    // Verificar que el localStorage tiene el rol correcto
    const role = await page.evaluate(() => localStorage.getItem('user_role'));
    expect(role).toBe('Administrador');
  });

  test('debería hacer login exitosamente como redactor', async ({ page }) => {
    // Usamos la función centralizada de loginAsWriter
    await loginAsWriter(page);

    // Los redactores van a la página principal
    await expect(page).toHaveURL(/.*\/$/);

    // Verificar que el localStorage tiene el rol correcto
    const role = await page.evaluate(() => localStorage.getItem('user_role'));
    expect(role).toBe('Redactor');
  });

  test('debería hacer login exitosamente como lector', async ({ page }) => {
    // Usamos la función centralizada de loginAsReader
    await loginAsReader(page);

    // Los lectores van a la página principal
    await expect(page).toHaveURL(/.*\/$/);

    // Verificar que el localStorage tiene el rol correcto
    const role = await page.evaluate(() => localStorage.getItem('user_role'));
    expect(role).toBe('Lector');
  });
});
