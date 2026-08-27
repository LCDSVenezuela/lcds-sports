# LCDS Sports

Catálogo deportivo mobile-first de La Casa del Softball, construido con Next.js, PostgreSQL y Vercel.

## Desarrollo

```bash
npm install
npm run dev
```

## Administración

La zona `/admin` usa autenticación propia con sesión segura almacenada en PostgreSQL. En la primera entrada, si todavía no existe un administrador, el sistema permite crear la cuenta inicial. Después, el acceso se realiza con correo y contraseña y las rutas administrativas quedan protegidas.

## Imágenes y banners

Las imágenes de productos y banners se almacenan en **Vercel Blob**. El proyecto espera un Blob Store público conectado a los entornos de Preview y Production. El panel permite seleccionar archivos desde PC o teléfono, previsualizarlos y guardarlos sin trabajar manualmente con URLs.

Formatos admitidos: JPG, PNG, WEBP y AVIF. Límite por imagen: 8 MB.

## Precios

- El precio público principal se administra en USD.
- Cada producto mantiene una referencia BCV interna que no se muestra al cliente.
- El precio público en bolívares se calcula automáticamente usando la tasa vigente configurada desde el panel.
- Las escalas mayoristas usan la misma lógica de USD + referencia interna para Bs.

## Deploy

GitHub alimenta los deployments de Preview y Production en Vercel. La base de datos PostgreSQL y Vercel Blob deben estar conectados al proyecto para habilitar todas las funciones administrativas.
