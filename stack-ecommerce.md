# Stack Tecnológico — Proyecto Ecommerce

## Requisitos del proyecto

- Ecommerce sin pasarela de pago
- Al menos 100 productos
- Modelo de datos: 2 clases con aproximadamente 8 parámetros cada una
- Alrededor de 2 fotos por producto
- Frontend en React
- Stack gratuito

## Stack definido

| Capa | Tecnología | Rol |
|---|---|---|
| **Frontend** | React (Vite) | Interfaz de usuario y catálogo de productos |
| **Capa intermedia** | API Routes de Next.js *(o funciones serverless de Vercel)* | Reemplaza al backend tradicional; expone endpoints que consultan la base de datos de forma segura, sin exponer credenciales en el cliente |
| **ORM** | Prisma | Modelado de las 2 clases, migraciones y consultas tipadas |
| **Base de datos** | Neon (PostgreSQL serverless) | Almacenamiento relacional de productos y su entidad relacionada |
| **Imágenes** | Cloudinary | Almacenamiento, optimización y entrega de las fotos de producto (sin requerir tarjeta de crédito en el plan gratuito) |
| **Hosting** | Vercel | Despliegue conjunto de frontend + funciones serverless, en un solo proveedor |

## Justificación de decisiones clave

- **Por qué no conectar React directo a Neon**: Postgres requiere credenciales de conexión que no deben exponerse en el bundle de JavaScript del cliente. Se necesita una capa intermedia (API Routes / funciones serverless) que mantenga esas credenciales del lado del servidor.
- **Por qué Cloudinary y no Firebase Storage**: desde febrero de 2026, Firebase Storage requiere vincular una tarjeta de crédito (plan Blaze) incluso para uso dentro de la franja gratuita. Cloudinary no exige tarjeta en su plan Free y además incluye transformación/optimización automática de imágenes.
- **Por qué Vercel para todo el hosting**: permite desplegar el frontend React y las funciones serverless en un mismo proveedor y flujo de despliegue, sin sumar infraestructura adicional.

## Próximos pasos

- [ ] Definir el esquema de Prisma para las 2 clases (8 parámetros c/u)
- [ ] Configurar estructura de carpetas del proyecto
- [ ] Configurar variables de entorno (Neon, Cloudinary)
