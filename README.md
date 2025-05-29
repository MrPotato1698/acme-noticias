# IBÑ NEWS - Proyecto Asignatura Mantenimiento y Gestión del Cambio en Sistemas Software

## 🗂️ Estructura del Proyecto

Dentro de nuestro proyecto Astro, vamos a ver la siguiente estructura de datos:

```text
/
├── public/
│   ├── favicon-dark.svg
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── IBNBlueLogo.webp
│   ├── components/
│   │   └── Componentes Astro
│   ├── db/
│   │   └── supabase.ts //Configuración BD
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   └── Scripts
│   ├── pages/
│   │   ├── admin/
|   │   │   ├── article/
│   │   │   │   └── [id]/
│   │   │   │        ├── commentaries.astro
│   │   │   │        └── index.astro
│   │   │   ├── authors/
│   │   │   │   └── [id].astro
│   │   │   ├── admin-article.astro
│   │   │   ├── admin-author.astro
│   │   │   └── admin-control.astro
│   │   ├── api/
|   │   │   ├── article/            //API para majejar articulos
│   │   │   │   └── commentaries/   //API para majejar comentarios
|   │   │   ├── auth/               //API para autenticación
│   │   │   ├── authors/            //API para manejar Redactores
│   │   │   └── categories/         // API para manejar las Categorías
│   │   ├── article/
|   │   │   └── [id].astro
│   │   ├── index.astro
│   │   ├── legal-notice.astro
│   │   ├── login.astro
│   │   ├── newarticle.astro
│   │   └── searchartcicle.astro
│   ├── style/
│   │   └── global.css  //Archivo de configuración de Tailwind
│   ├── test/           // Carpeta para guardar los diferentes test
│   ├── env.d.ts        //Archivo que indica el contenido del archivo .env
│   └── middleware.ts   //Middleware para test E2E
├── .gitignore
├── astro.config.mjs      //Configuración de Astro
├── database.types.ts     // Configuración de los tipos de la BD
├── package-lock.json
├── package.json
├── playwright.config.ts  //Configuración de Playwright
├── README.md
├── TESTING.md
└── tsconfig.json         //Configuración de Typescript

```

## 🧞 Comandos

Todos los comandos son para iniciarlos desde la ruta del proyecto, desde un terminal:

| Comando                   | Acción                                                          |
| :------------------------ | :-------------------------------------------------------------- |
| `npm install`             | Instala las dependencias                                        |
| `npm run dev`             | Arranca un servidor local en modo desarrollo en `localhost:4321`|
| `npm run build`           | Compila el proyecto para producción en la carpeta `./dist/`     |
| `npm run preview`         | Vista previa de tu proyecto compilado, antes de desplegar       |
| `npm run astro ...`       | Inicia comandos CLI como `astro add`, `astro check`             |
| `npm run astro -- --help` | Obtener ayuda usando el Astro CLI                               |
| `npm run test`            | Iniciar test End to End de Playwright                           |
| `npm run test:ui` | Iniciar test End to End de Playwright con interfaz gráfica              |

## 👀 Proyecto desplegado

Este proyecto está desplegado en Vercel en el siguiente enlace:

🔗 **[IBN News - Sitio en Vivo](https://ibnnews.vercel.app)**
