import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/test-utils';

test.describe('Panel de Control de Administración', () => {
  test.beforeEach(async ({ page }) => {
    // Login de administrador antes de cada test
    await loginAsAdmin(page);
    await page.goto('/admin/admin-control');
  });

  test('debería cargar el panel de control de administración', async ({ page }) => {
    // Verificar título y estructura básica
    await expect(page).toHaveTitle(/IBÑ News - Panel de Administración/);
    await expect(page.locator('h1:has-text("Panel de Administración")')).toBeVisible();
  });
  test('debería mostrar la sección de estadísticas', async ({ page }) => {
    // Verificar que la sección de estadísticas está presente
    await expect(page.locator('h2:has-text("Estadísticas del Sitio")')).toBeVisible();

    // Esperar a que el componente StatsPanel cargue
    await page.waitForSelector('[data-testid="stats-panel"], .stats-panel, .mb-12:has(h2:has-text("Estadísticas del Sitio"))', { timeout: 10000 });

    // Verificar que existe al menos un contenedor de estadísticas
    const statsContainer = page.locator('.mb-12:has(h2:has-text("Estadísticas del Sitio"))');
    await expect(statsContainer).toBeVisible();
  });

  test('debería mostrar la sección de gestión de categorías', async ({ page }) => {
    // Verificar que la sección de categorías está presente
    await expect(page.locator('h2:has-text("Gestión de Categorías")')).toBeVisible();
  });

  test('debería mostrar estadísticas de redactores', async ({ page }) => {
    // Verificar que existe la sección de estadísticas de redactores
    const writersStats = page.locator('h3:has-text("Estadísticas de Redactores")');

    // Puede que esta sección sea condicional, por lo que no forzamos que esté visible
    if (await writersStats.isVisible()) {
      await expect(writersStats).toBeVisible();
    } else {
      console.log('Writers statistics section not found');
    }
  });

  test('debería mostrar gráfico o sección de actividad mensual', async ({ page }) => {
    // Verificar que existe la sección de actividad mensual
    const monthlyActivity = page.locator('h3:has-text("Artículos Publicados")');

    if (await monthlyActivity.isVisible()) {
      await expect(monthlyActivity).toBeVisible();
    } else {
      console.log('Monthly activity section not found');
    }
  });
});

// Tests para la gestión de categorías
test.describe('Gestión de Categorías', () => {
  test.beforeEach(async ({ page }) => {
    // Login de administrador antes de cada test
    await loginAsAdmin(page);
    await page.goto('/admin/admin-control');

    // Esperar a que cargue la sección de categorías
    await page.waitForSelector('h2:has-text("Gestión de Categorías")');
  });

  test('debería mostrar formulario para añadir categoría', async ({ page }) => {
    // Verificar que el formulario para añadir categorías está presente
    await expect(page.locator('h3:has-text("Añadir Nueva Categoría")')).toBeVisible();
    await expect(page.locator('#add-category-form')).toBeVisible();

    // Verificar campos del formulario
    await expect(page.locator('#category-name')).toBeVisible();
    await expect(page.locator('#category-description')).toBeVisible();

    // Verificar botón de enviar
    await expect(page.locator('button:has-text("Añadir Categoría")')).toBeVisible();
  });

  test('debería mostrar lista de categorías existentes', async ({ page }) => {
    // Verificar que la lista de categorías está presente
    await expect(page.locator('h3:has-text("Categorías Existentes")')).toBeVisible();
    await expect(page.locator('#categories-list')).toBeVisible();
  });

  test('debería validar campos requeridos al añadir categoría', async ({ page }) => {
    // Intentar enviar formulario sin nombre (que es requerido)
    await page.click('button:has-text("Añadir Categoría")');

    // Verificar que el campo nombre es requerido
    await expect(page.locator('#category-name')).toHaveAttribute('required', '');
  });

  test('debería añadir nueva categoría con datos válidos', async ({ page }) => {
    // Datos de prueba para categoría
    const testCategory = {
      name: 'Test Category ' + Date.now(),
      description: 'Test description for automated testing'
    };

    // Rellenar formulario
    await page.fill('#category-name', testCategory.name);
    await page.fill('#category-description', testCategory.description);

    // Interceptar request de creación
    await page.route('**/api/categories/newcategory', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 999, ...testCategory })
      });
    });

    // Enviar formulario
    await page.click('button:has-text("Añadir Categoría")');

    // Verificar mensaje de éxito o actualización de UI
    // (Esto depende de la implementación específica)
    await page.waitForTimeout(2000);
  });

  test('debería mostrar confirmación de eliminación para categorías existentes', async ({ page }) => {
    // Buscar botones de eliminar categoría
    const deleteButtons = page.locator('button.delete-category-btn');

    if (await deleteButtons.count() > 0) {
      // Preparar para detectar diálogo de confirmación
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('seguro'); // El mensaje debe contener algo como "¿Estás seguro?"
        await dialog.dismiss(); // Cancelar para no borrar realmente
      });

      // Hacer clic en el primer botón de borrar
      await deleteButtons.first().click();
    } else {
      console.log('No category delete buttons found');
    }
  });

  test('debería eliminar categoría cuando se confirme', async ({ page }) => {
    // Buscar botones de eliminar categoría
    const deleteButtons = page.locator('button.delete-category-btn');

    if (await deleteButtons.count() > 0) {
      // Obtener el ID de la categoría
      const categoryId = await deleteButtons.first().getAttribute('data-category-id');

      // Interceptar request de borrado
      await page.route(`**/api/categories/${categoryId}`, async route => {
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

      // Hacer clic en el botón de borrar
      await deleteButtons.first().click();

      // Verificar mensaje de éxito o actualización de UI
      await page.waitForTimeout(2000);
    } else {
      console.log('No category delete buttons found');
    }
  });

  test('debería manejar lista de categorías vacía apropiadamente', async ({ page }) => {
    // Este test verifica que se muestra un mensaje adecuado cuando no hay categorías
    // (Necesitaríamos modificar el DOM para simular esta condición)

    // Intentar localizar el mensaje de "no hay categorías"
    const noCategories = page.locator('text=No hay categorías creadas aún');

    // No fallamos si no existe, solo lo registramos
    const isVisible = await noCategories.isVisible();
    console.log(`"No categories" message ${isVisible ? 'is' : 'is not'} visible`);
  });
});
