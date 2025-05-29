# Guía para los Tests End-to-End de ACME Noticias

Este documento detalla cómo ejecutar y mantener los tests end-to-end (E2E) del proyecto ACME Noticias.

## Requisitos Previos

- Node.js instalado (recomendado v14 o superior)
- npm o yarn
- El proyecto ACME Noticias clonado e instalado

## Instalación

Si aún no has instalado las dependencias del proyecto:

```bash
npm install
```

## Instalación de Navegadores para Playwright

Para asegurar que todos los navegadores necesarios estén instalados:

```bash
npx playwright install
```

## Ejecución de Tests

### Ejecutar todos los tests

Para ejecutar todos los tests E2E:

```bash
npm run test
```

### Ejecutar tests con la interfaz visual de Playwright

```bash
npm run test:ui
```

### Ejecutar tests en modo debug

```bash
npm run test:debug
```

### Ver el informe de tests después de ejecutarlos

```bash
npm run test:report
```

### Ejecutar tests específicos

Para ejecutar solo un archivo de test específico:

```bash
npx playwright test src/tests/e2e-test/homepage.spec.ts
```

Para ejecutar un test con un nombre específico:

```bash
npx playwright test -g "should load homepage with correct title"
```

## Estructura de los Tests

Los tests están organizados en archivos por funcionalidad:

- `homepage.spec.ts`: Tests de la página principal
- `search.spec.ts`: Tests de funcionalidad de búsqueda
- `auth.spec.ts`: Tests de autenticación
- `article.spec.ts`: Tests de visualización de artículos
- `admin-article.spec.ts`: Tests de administración de artículos
- `admin-control.spec.ts`: Tests del panel de administración
- `admin-author.spec.ts`: Tests de administración de redactores

## Helpers y Utilidades

Se han creado funciones de ayuda en `src/tests/helpers/test-utils.ts` para facilitar tareas comunes como:

- Login con diferentes roles de usuario
- Comprobación de elementos comunes en todas las páginas
- Generación de datos de prueba

## Consideraciones Importantes

1. **Datos de Prueba**: Los tests usan datos mockados para evitar modificar datos reales.

2. **Navegadores**: Los tests se ejecutan en múltiples navegadores (Chrome, Firefox, WebKit).

3. **Servidor Web**: Durante los tests se inicia automáticamente el servidor web local.

4. **CI/CD**: Los tests están configurados para ejecutarse en entornos de integración continua.

## Mantenimiento

Al agregar nuevas funcionalidades al proyecto, se recomienda:

1. Crear nuevos archivos de test si son funcionalidades completamente nuevas
2. Extender los archivos existentes para funcionalidades relacionadas
3. Actualizar los helpers cuando sea necesario
4. Mantener los test independientes entre sí para evitar fallos en cascada

## Solución de Problemas

- Si los tests fallan con `timeout`, considera aumentar los tiempos de espera o mejorar la estrategia de detección
- Si hay problemas con la autenticación, verifica que los mocks estén configurados correctamente
- Para depurar tests específicos, usa el modo debug o la interfaz de usuario

## Referencias

- [Documentación de Playwright](https://playwright.dev/docs/intro)
- [Guías de Astro](https://docs.astro.build/en/getting-started/)
