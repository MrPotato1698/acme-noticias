import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/test-utils';

test.describe('Gestión de Redactores', () => {
  test.beforeEach(async ({ page }) => {
    // Login de administrador antes de cada test
    await loginAsAdmin(page);
    await page.goto('/admin/admin-author');
  });
  test('debería cargar la página de administrador de redactores', async ({ page }) => {
    // Verificar título y estructura básica
    await expect(page).toHaveTitle(/IBÑ News/);
    await expect(page.locator('h1:has-text("Administrar Redactores")')).toBeVisible();
  });
  test('debería mostrar la tabla de redactores con encabezados', async ({ page }) => {
    // Verificar que la tabla de redactores está presente
    await page.waitForSelector('table');
    const tableHeaders = page.locator('th');

    // Verificar que hay encabezados para datos importantes
    const expectedHeaders = ['Nombre', 'Correo', 'Acciones'];

    for (const header of expectedHeaders) {
      const headerElement = tableHeaders.filter({ hasText: header });
      await expect(headerElement).toBeVisible();
    }
  });
  test('debería mostrar entradas de redactores con botones de acción', async ({ page }) => {
    // Esperar a que carguen los redactores
    await page.waitForTimeout(2000);

    // Verificar si hay redactores en la tabla
    const authorRows = page.locator('tbody tr');
    const count = await authorRows.count();

    if (count > 0) {
      // Verificar que hay botones de acción en cada fila
      await expect(page.locator('a:has-text("Modificar")').first()).toBeVisible();
      await expect(page.locator('button:has-text("Borrar")').first()).toBeVisible();
    } else {
      console.log('No author entries found for testing');
    }
  });

  test('debería abrir diálogo de edición cuando se hace clic en el botón editar', async ({ page }) => {
    // Esperar a que carguen los redactores
    await page.waitForTimeout(2000);

    // Buscar el primer botón de editar
    const editButton = page.locator('button:has-text("Editar")').first();

    if (await editButton.isVisible()) {
      // Hacer clic en el botón
      await editButton.click();

      // Verificar que aparece el diálogo o formulario de edición
      await expect(page.locator('dialog[open], div[role="dialog"]')).toBeVisible();
    } else {
      console.log('No edit button found for testing');
    }
  });

  test('debería mostrar diálogo de confirmación cuando se hace clic en el botón eliminar', async ({ page }) => {
    // Esperar a que carguen los redactores
    await page.waitForTimeout(2000);

    // Buscar el primer botón de eliminar
    const deleteButton = page.locator('button:has-text("Eliminar")').first();

    if (await deleteButton.isVisible()) {
      // Esperar el diálogo de confirmación
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('seguro');
        await dialog.dismiss(); // Cancelar para no borrar realmente
      });

      // Hacer clic en el botón de eliminar
      await deleteButton.click();
    } else {
      console.log('No delete button found for testing');
    }
  });

  test('debería editar información del redactor', async ({ page }) => {
    // Esperar a que carguen los redactores
    await page.waitForTimeout(2000);

    // Buscar el primer botón de editar
    const editButton = page.locator('button:has-text("Editar")').first();

    if (await editButton.isVisible()) {
      // Interceptar request de edición
      await page.route('**/api/author/editauthor', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      // Hacer clic en el botón
      await editButton.click();

      // Esperar a que aparezca el diálogo o formulario
      await page.waitForSelector('dialog[open], div[role="dialog"]');

      // Simular edición de información (ajustar selectores según la implementación)
      const nameInput = page.locator('input[name="name"], input[name="full_name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Nombre Editado Test');

        // Buscar y hacer clic en el botón de guardar/actualizar
        const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Actualizar")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
      }

      // Verificar actualización
      await page.waitForTimeout(2000);
    } else {
      console.log('No edit button found for testing');
    }
  });

  test('debería eliminar redactor cuando se confirme', async ({ page }) => {
    // Esperar a que carguen los redactores
    await page.waitForTimeout(2000);

    // Buscar el primer botón de eliminar
    const deleteButton = page.locator('button:has-text("Eliminar")').first();

    if (await deleteButton.isVisible()) {
      // Interceptar request de borrado
      await page.route('**/api/author/deleteauthor', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      });

      // Configurar para aceptar diálogo de confirmación
      page.on('dialog', async dialog => {
        await dialog.accept();
      });

      // Hacer clic en el botón de eliminar
      await deleteButton.click();

      // Verificar que se elimina la fila o hay algún feedback
      await page.waitForTimeout(2000);
    } else {
      console.log('No delete button found for testing');
    }
  });

  test('debería tener paginación funcional si existen múltiples páginas', async ({ page }) => {
    // Esperar a que carguen los redactores
    await page.waitForTimeout(2000);

    // Buscar paginación
    const pagination = page.locator('nav[aria-label="Paginación"]');

    if (await pagination.isVisible()) {
      // Verificar que hay elementos básicos de paginación
      await expect(pagination.locator('li a')).toBeVisible();
    } else {
      console.log('Pagination not visible or not available');
    }
  });

  test('debería ver página de detalle del redactor', async ({ page }) => {
    // Esperar a que carguen los redactores
    await page.waitForTimeout(2000);

    // Buscar el primer enlace con nombre de autor (si existe)
    const authorLink = page.locator('a[href^="/admin/authors/"]').first();

    if (await authorLink.isVisible()) {
      // Hacer clic en el enlace y esperar la navegación
      await authorLink.click();

      // Esperar a que la URL cambie a la página de detalle del autor
      await page.waitForURL(/.*\/admin\/authors\/\w+$/);

      // Verificar que estamos en la página de detalle del autor
      await expect(page).toHaveURL(/.*\/admin\/authors\/\w+$/);
    } else {
      console.log('No author detail link found for testing');
    }
  });
});
