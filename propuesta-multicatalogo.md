# Propuesta de replicación y mejora: sistema multi catálogo con pedidos por WhatsApp

## 1. Lectura rápida del sistema actual

Basado en las capturas, el sistema actual ya resuelve una necesidad real:

- Catálogo visual por tienda.
- Productos agrupados por categorías.
- Acceso rápido a WhatsApp.
- Panel administrativo para tiendas, banners, productos, categorías y usuarios.
- Versión móvil y desktop.

Pero también deja varias oportunidades claras de mejora:

### Lo que funciona

- La idea de "tienda dentro de un catálogo mayor" es buena para marketplaces locales.
- El flujo de descubrir tienda -> ver productos -> pedir por WhatsApp es simple.
- Hay estructura mínima de administración multi tienda.
- Los banners ayudan a vender promociones.

### Lo que se ve débil

- La interfaz se siente visualmente antigua y muy repetitiva.
- Hay exceso de azul y poca jerarquía visual.
- Desktop y móvil parecen adaptaciones, no experiencias diseñadas desde cero.
- El admin tiene tablas densas y poco cómodas para operar a escala.
- No se percibe una separación sólida entre "superadmin" y "dueño de tienda".
- Falta una experiencia fuerte de marca por empresa.
- El pedido por WhatsApp parece útil, pero no se ve un carrito serio con variantes, notas, cantidades y seguimiento del mensaje.
- No se ve soporte claro para:
  - subdominios por empresa
  - dominio propio por empresa
  - SEO por tienda/producto
  - analítica
  - plantillas de diseño
  - onboarding guiado

## 2. Qué debería ser la versión mejorada

La versión nueva debería ser un **SaaS multi-tenant** donde cada empresa tenga:

- `empresa1.midominio.com`
- `empresa2.midominio.com`
- o su propio dominio: `www.empresa.com`

Y donde el superadmin pueda administrar toda la plataforma, mientras cada negocio maneja su propio catálogo.

## 3. Modelo de negocio recomendado

### Opción A: SaaS por suscripción

- Plan Básico: 1 catálogo, 1 usuario, subdominio.
- Plan Pro: dominio propio, más usuarios, analítica, más banners.
- Plan Plus: múltiples sucursales, más vendedores, automatizaciones.

### Opción B: SaaS + setup

- Cobro por implementación inicial.
- Mensualidad por hosting, soporte y mejoras.

### Opción C: Marketplace + catálogo individual

- Existe un portal central tipo marketplace.
- Cada empresa además tiene su micro-sitio independiente.

Esto último encaja muy bien con lo que muestran las capturas.

## 4. Arquitectura funcional recomendada

### Roles

- `super_admin`
  - Crea y supervisa tenants.
  - Aprueba dominios.
  - Ve métricas globales.
- `tenant_owner`
  - Administra su empresa, catálogo, banners, WhatsApp, diseño y dominio.
- `tenant_staff`
  - Gestiona productos, categorías y pedidos.

### Entidades principales

- `tenants`
- `domains`
- `users`
- `memberships`
- `stores` o `branches`
- `categories`
- `products`
- `product_variants`
- `product_images`
- `banners`
- `promotions`
- `promotion_rules`
- `coupons`
- `whatsapp_settings`
- `orders` o `quote_requests`
- `theme_settings`
- `pages`
- `analytics_events`

## 5. Multiempresa real: cómo resolver subdominios y dominio propio

### Resolución por subdominio

Ejemplos:

- `empresa1.midominio.com`
- `empresa2.midominio.com`

Cada hostname apunta al mismo frontend. La app resuelve el tenant por el dominio recibido.

### Resolución por dominio propio

Ejemplos:

- `catalogos.empresa.com`
- `tienda.empresa.com`
- `empresa.com`

Se registra el dominio en la tabla `domains`, se verifica y luego se asocia al tenant.

### Tabla sugerida: `domains`

- `id`
- `tenant_id`
- `hostname`
- `type` (`subdomain`, `custom`)
- `is_primary`
- `verification_status`
- `ssl_status`
- `created_at`

### Flujo recomendado

1. El negocio crea su cuenta.
2. Se le asigna un subdominio automático.
3. Si quiere dominio propio, agrega su hostname.
4. El sistema le muestra el registro DNS que debe crear.
5. Se verifica el dominio.
6. Se marca como principal.

## 6. Stack técnico recomendado

### Stack elegido

- Frontend web: `Next.js` con React
- Backend/API: `NestJS`
- Base de datos: `PostgreSQL`
- ORM: `Prisma`
- Autenticacion: `Supabase Auth`
- Archivos e imagenes: `Cloudflare R2`
- CDN, DNS y proxy: `Cloudflare`
- Email transaccional: `Resend`
- Analitica de producto: `PostHog`
- Cache / colas: `Redis`

### Arquitectura recomendada con este stack

- `Next.js`
  - storefront publico
  - panel tenant admin
  - panel superadmin
- `NestJS`
  - API multi-tenant
  - reglas de promociones
  - gestion de dominios
  - integraciones
  - auditoria
- `Supabase Auth`
  - login
  - sesiones
  - recovery
  - magic link si lo quieres
- `PostgreSQL + Prisma`
  - datos de negocio
  - relaciones multi-tenant

### Nota sobre Cloudflare R2

R2 si tiene free tier, pero no es almacenamiento gratis ilimitado.

- Conviene para empezar si el trafico y el volumen de imagenes son moderados.
- Si creces mucho en lecturas, debes vigilar el costo de operaciones.
- La ventaja fuerte es que el egress hacia Internet no tiene cargo en la clase estandar.

### Cuando usar R2 en este proyecto

- Logos
- banners
- imagenes de producto
- exportaciones
- archivos de apoyo del tenant

### Cuando no asumir que R2 sera "gratis"

- si vas a servir muchisimas imagenes sin optimizacion
- si el catalogo tiene trafico alto y lectura intensiva
- si piensas almacenar originales demasiado pesados

## 7. Cómo resolver el tenant en la aplicación

La app debe identificar la empresa por el `hostname`.

### Lógica

- Si el host termina en `midominio.com`, tomar el subdominio.
- Si no, buscar coincidencia exacta en `domains.hostname`.
- Cargar `tenant`, tema, tienda principal, banners, categorías y productos.

### Ejemplo conceptual

```ts
function resolveTenant(hostname: string) {
  if (hostname.endsWith(".midominio.com")) {
    const subdomain = hostname.replace(".midominio.com", "");
    return findTenantBySubdomain(subdomain);
  }

  return findTenantByCustomDomain(hostname);
}
```

## 8. Estructura de datos mínima

### `tenants`

- `id`
- `name`
- `slug`
- `subdomain`
- `status`
- `plan`
- `logo_url`
- `cover_url`
- `primary_color`
- `secondary_color`
- `whatsapp_number`
- `created_at`

### `products`

- `id`
- `tenant_id`
- `category_id`
- `name`
- `slug`
- `short_description`
- `description`
- `price`
- `compare_at_price`
- `currency`
- `status`
- `featured`
- `sku`
- `stock`
- `created_at`

### `quote_requests`

- `id`
- `tenant_id`
- `customer_name`
- `customer_phone`
- `message`
- `source`
- `status`
- `created_at`

### `quote_request_items`

- `id`
- `quote_request_id`
- `product_id`
- `product_name`
- `quantity`
- `unit_price`
- `variant_name`

### `promotions`

- `id`
- `tenant_id`
- `name`
- `slug`
- `type`
- `status`
- `starts_at`
- `ends_at`
- `priority`
- `banner_url`
- `coupon_code`
- `stackable`
- `created_at`

### `promotion_rules`

- `id`
- `promotion_id`
- `scope` (`all_products`, `category`, `product`, `brand`, `cart`)
- `operator`
- `value`
- `min_quantity`
- `min_amount`

### `coupons`

- `id`
- `tenant_id`
- `code`
- `status`
- `max_uses`
- `max_uses_per_customer`
- `starts_at`
- `ends_at`
- `promotion_id`

## 9. Pedidos por WhatsApp bien hechos

Aquí está una mejora importante. En vez de mandar solo "hola, quiero este producto", conviene un flujo más estructurado:

### Flujo ideal

1. El usuario agrega productos al carrito.
2. Define cantidades y variantes.
3. Puede añadir notas.
4. El sistema arma un mensaje limpio.
5. Se redirige a WhatsApp con texto precargado.
6. Se guarda el intento de pedido en la base de datos.

### Ejemplo de mensaje

```txt
Hola, quiero hacer un pedido en Indumentaria:

- Nike Air Max TW x2
- Remera Nike Dry Fit talla M x1

Total estimado: $390.00
Nombre: Juan Perez
Entrega: retiro en tienda
Observaciones: confirmar disponibilidad
```

### Beneficio

- Mejor conversión.
- Mejor trazabilidad.
- Menos mensajes ambiguos.

## 10. Mejoras funcionales clave

### Público

- Home del tenant con branding real.
- Catálogo por categorías.
- Buscador rápido.
- Filtros por precio, marca, talla, color, stock.
- Producto con galería, variantes y descripción clara.
- Carrito para pedido por WhatsApp.
- Promociones activas con vigencia y condiciones visibles.
- Cupones promocionales.
- Precio normal, precio promocional y ahorro porcentual.
- Productos destacados, nuevos y más vendidos.
- Compartir producto o tienda.
- Favoritos.
- SEO por producto y categoría.
- Página de promociones.
- Página de contacto y ubicación.
- PWA instalable.

### Tenant admin

- Dashboard con métricas útiles.
- Gestión de productos con carga masiva.
- Gestión de banners por posición.
- Gestión de promociones, campañas y cupones.
- Editor de tema: colores, tipografía, bordes, estilo de tarjetas.
- Configuración de WhatsApp.
- Configuración de dominio propio.
- Gestión de usuarios del tenant.
- Configuración SEO.
- Importación por Excel/CSV.
- Duplicado rápido de productos.
- Control de stock.
- Gestión de pedidos o solicitudes.

### Superadmin

- Alta/baja de tenants.
- Gestión de planes.
- Auditoría de actividad.
- Métricas globales.
- Control de dominios y verificación.
- Soporte y anuncios a tenants.

## 11. Rediseño recomendado

Las capturas tienen buena intención comercial, pero el lenguaje visual puede subir mucho.

### Problemas visuales del diseño actual

- La UI depende demasiado del mismo azul.
- Hay sombras y contenedores con aspecto antiguo.
- Las tablas son pesadas y poco elegantes.
- La navegación pública se siente algo fragmentada.
- Los banners de producto/tipo promo compiten demasiado con el contenido real.

### Dirección visual recomendada

- Fondo claro cálido o gris suave, no blanco plano puro.
- Menos bordes gruesos.
- Tipografía más moderna y con mejor contraste.
- Cards con imagen más protagonista.
- Mayor aire entre bloques.
- Jerarquía clara entre tienda, categoría y producto.
- Navegación sticky en móvil.
- CTA de WhatsApp fijo pero menos invasivo.
- Prohibido el uso de emojis en la interfaz; usar solo iconos del sistema visual.

### Diseño público sugerido

- Hero limpio con branding del tenant.
- Chips de categoría más refinados.
- Grid responsive de productos.
- Barra superior con búsqueda y carrito.
- Sección "más vendidos", "nuevos", "ofertas".
- Página de producto más editorial, no solo ficha.
- Módulos de campañas tipo Cyber, Flash Sale, Liquidación y Temporada.

### Diseño admin sugerido

- Sidebar más compacta.
- Dashboard con KPIs reales:
  - visitas
  - clics a WhatsApp
  - productos más vistos
  - tasa de conversión a WhatsApp
- Tablas con:
  - filtros guardables
  - columnas configurables
  - acciones masivas
- Formularios por pasos para crear tienda y configurar dominio.

## 12. Diferenciadores para que no sea "otro catálogo más"

- Plantillas visuales por rubro:
  - moda
  - restaurante
  - tecnología
  - farmacia
  - ferretería
- Dominio propio por empresa.
- Catálogo optimizado para compartir en WhatsApp e Instagram.
- Analítica de clics a WhatsApp.
- Link de producto directo con mensaje precargado.
- Catálogo en modo sucursal.
- Códigos QR por tienda, categoría o producto.
- Landing pública del marketplace central.
- IA opcional para:
  - mejorar descripciones
  - remover fondo de imágenes
  - generar banners rápidos

## 13. MVP recomendado

Si quieres construirlo sin inflarlo demasiado, este sería el MVP correcto:

### Fase 1

- Multi tenant
- Subdominios por empresa
- Catálogo público por tenant
- Dashboard tenant
- Productos, categorías, banners
- Carrito hacia WhatsApp
- Panel superadmin básico
- Promociones simples por producto y categoría

### Fase 2

- Dominios propios
- Temas por tenant
- SEO
- Analítica
- Importación CSV/Excel
- Roles por tenant
- Cupones, reglas de promoción y calendario de campañas

### Fase 3

- Sucursales
- Variantes avanzadas
- Stock
- QR
- automatizaciones
- IA para contenido
- segmentación promocional avanzada

## 14. Riesgos que debes resolver desde el inicio

- Aislamiento de datos entre tenants.
- Resolución correcta por dominio/subdominio.
- Manejo de imágenes a escala.
- SEO multi dominio.
- Construcción correcta del mensaje de WhatsApp.
- No depender de tablas pesadas para toda la operación.
- Mantener buen rendimiento con miles de productos.

## 15. Recomendación concreta de implementación

Si yo tuviera que arrancarlo hoy, lo haría así:

1. `Next.js` con app router.
2. `PostgreSQL + Prisma`.
3. Resolución de tenant por middleware.
4. Un solo frontend para todos los tenants.
5. Tema configurable por tenant.
6. Carrito ligero que termina en WhatsApp.
7. Panel separado por rol:
   - superadmin
   - tenant admin
8. Dominio propio desde fase 2, pero con tabla `domains` desde el primer día.

## 16. Conclusión

Sí vale la pena replicarlo, pero no copiarlo tal cual.

La oportunidad real no está en repetir la interfaz actual, sino en convertirla en una plataforma multiempresa moderna, con:

- arquitectura multi-tenant limpia
- subdominios y dominios propios
- mejor conversión a WhatsApp
- mejor dashboard
- mejor branding por empresa
- diseño más premium y actual

La base del negocio es buena. Lo que necesita es una ejecución técnica y visual más fuerte.

## 17. Sistema de promociones recomendado

El sistema de promociones no debe ser solo un banner bonito. Debe tener reglas reales y medibles.

### Tipos de promoción

- Descuento porcentual:
  - `20% OFF`
- Descuento fijo:
  - `$10` menos
- Precio especial:
  - antes / ahora
- 2x1 o `buy X get Y`
- Descuento por categoría
- Descuento por marca
- Cupón manual
- Promoción automática por monto mínimo
- Campaña con horario:
  - flash sale
  - cyber
  - fin de semana

### Reglas que conviene soportar

- Vigencia por fecha y hora.
- Límite de uso total.
- Límite por cliente.
- Aplicación por tenant.
- Aplicación por producto, categoría o carrito.
- Compatibilidad o incompatibilidad con otras promos.
- Orden de prioridad cuando hay varias reglas.

### Comportamiento recomendado en la UI

- Badge visual discreto:
  - `Oferta`
  - `Cyber`
  - `2x1`
- Mostrar precio anterior tachado y ahorro real.
- Mostrar fecha de vigencia cuando aplique.
- Mostrar condiciones resumidas:
  - `Válido hasta el 30/04`
  - `Aplica en productos seleccionados`
- En carrito, indicar qué promoción se aplicó.
- En el mensaje a WhatsApp, enviar también el detalle promocional.

### Comportamiento recomendado en admin

- Calendario de campañas.
- Editor de reglas.
- Vista previa de productos afectados.
- Activación programada.
- KPI por campaña:
  - vistas
  - clics
  - pedidos iniciados
  - clics a WhatsApp
  - tasa de conversión

### Ejemplo de mensaje con promoción

```txt
Hola, quiero pedir estos productos:

- Nike Air Max TW x1 - Precio promo: $90.00
- Remera Dry Fit x2 - Promo 2x1 aplicada

Subtotal: $180.00
Promociones aplicadas: CYBER20
Total estimado: $160.00
```

## 18. Ciberseguridad y controles obligatorios

En un SaaS multiempresa esto no es opcional. Hay que diseñarlo bien desde el primer sprint.

### Riesgos principales

- Fuga de datos entre tenants.
- Enumeración de recursos por IDs predecibles.
- Panel admin expuesto.
- Subida de archivos inseguros.
- Abuso del formulario o del enlace a WhatsApp.
- Secuestro de dominio custom mal configurado.
- Exposición de secretos en frontend o CI/CD.

### Controles mínimos obligatorios

- Aislamiento por `tenant_id` en todas las consultas.
- Autorización por rol y por tenant, no solo autenticación.
- IDs públicos no secuenciales:
  - usar `uuid` o `cuid`
- Validación estricta en servidor.
- Sanitización de input en formularios y contenido editable.
- Rate limiting en login, búsqueda, APIs y generación de enlaces.
- Logs de auditoría para cambios sensibles.
- CSRF en acciones con sesión.
- Protección XSS con escape de salida y sanitización HTML si hubiera contenido rico.
- Protección SSRF si luego integras importación por URL o scraping.
- Protección contra subida de archivos maliciosos:
  - validar MIME
  - validar tamaño
  - renombrado seguro
  - almacenar fuera del servidor web
- Hash seguro para contraseñas:
  - `Argon2id` o `bcrypt` con parámetros actuales
- Rotación y resguardo de secretos.
- Backups cifrados y probados.

### Headers y políticas web recomendadas

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

### Seguridad específica para multi dominio

- Verificar propiedad del dominio antes de activarlo.
- Normalizar `hostname` y bloquear caracteres inválidos.
- Evitar que un tenant pueda reclamar dominios internos o reservados.
- Revalidar el dominio antes de marcarlo como principal.
- Manejar certificados TLS automáticos y monitoreo de expiración.

### Seguridad en autenticación y panel

- MFA para `super_admin`.
- MFA opcional o forzada en planes altos para `tenant_owner`.
- Bloqueo temporal por intentos fallidos.
- Revocación de sesiones.
- Registro de IP, user agent y eventos críticos.

### Seguridad operativa

- Dependabot o Renovate para dependencias.
- SAST y escaneo de secretos en CI.
- Entorno separado:
  - `dev`
  - `staging`
  - `production`
- Mínimo privilegio en base de datos, storage y CI/CD.

## 19. Lineamientos React para la web

Para la parte web conviene usar React con `Next.js`, pero con criterio de arquitectura y rendimiento.

### Recomendación base

- `Next.js` con App Router para frontend.
- `NestJS` como backend desacoplado.
- React Server Components por defecto.
- Client Components solo donde haga falta:
  - filtros interactivos
  - carrito
  - favoritos
  - buscador en vivo
  - paneles con tablas dinámicas

### Estructura sugerida

- `app/(public)`
- `app/(tenant-admin)`
- `app/(superadmin)`
- `components/ui`
- `components/catalog`
- `components/admin`
- `lib/auth`
- `lib/tenant`
- `lib/security`
- `lib/analytics`

### Estructura sugerida de backend

- `apps/api`
- `src/modules/auth`
- `src/modules/tenants`
- `src/modules/domains`
- `src/modules/catalog`
- `src/modules/promotions`
- `src/modules/orders`
- `src/modules/uploads`
- `src/modules/analytics`
- `src/modules/admin`
- `src/common`

### Criterios técnicos

- Resolver tenant en `middleware` o capa de request.
- Hacer fetch de catálogo público en servidor.
- Dejar hidratación mínima en cliente.
- Usar paginación e infinite scroll con cuidado.
- Evitar un frontend completamente SPA si el objetivo es SEO y performance.

### Estado recomendado

- Estado del servidor:
  - React Query o fetch server-side según caso
- Estado local:
  - `useState` / `useReducer`
- Estado global mínimo:
  - carrito
  - sesión visual
  - preferencias de UI

### Formularios

- `react-hook-form` + `zod`
- Validación duplicada:
  - cliente para UX
  - servidor para seguridad real

### UI e iconografía

- Biblioteca de iconos consistente:
  - `Lucide`
  - `Heroicons`
  - `Tabler Icons`
- Crear un wrapper `AppIcon` para evitar mezclas visuales.
- Regla explícita:
  - no usar emojis en botones, badges, menús, mensajes ni campañas
- Si un tenant quiere "decoración", usar ilustraciones, íconos o stickers gráficos, nunca emojis Unicode como recurso de interfaz.

### Testing mínimo

- Unit tests para reglas promocionales.
- Integration tests para resolución de tenant.
- E2E para:
  - crear tienda
  - cargar producto
  - aplicar promoción
  - enviar pedido a WhatsApp
  - login admin

## 20. Regla de diseño: sin emojis, solo iconos

Esto debe quedar como guideline de producto y también como regla operativa.

### Regla

- No usar emojis en:
  - navegación
  - badges
  - tablas
  - cards
  - dashboards
  - títulos
  - campañas
  - mensajes del sistema

### Motivo

- Los emojis rompen consistencia visual entre plataformas.
- Se ven poco profesionales en paneles SaaS.
- Cambian según sistema operativo y navegador.
- Dificultan mantener una identidad premium.

### Aplicación práctica

- Toda acción debe representarse con icono del sistema:
  - buscar
  - editar
  - eliminar
  - compartir
  - WhatsApp
  - carrito
  - promociones
- Definir tamaños, stroke, color y espaciado estándar.
- Mantener accesibilidad con `aria-label` y texto visible cuando haga falta.

## 21. Despliegue recomendado

El despliegue debe pensarse para multi-tenant y multi-dominio desde el principio.

### Opción recomendada para salir rápido

- Frontend web:
  - `Vercel`
- Backend `NestJS`:
  - `Railway`, `Render`, `Fly.io` o VPS
- Base de datos:
  - `Neon`, `Supabase Postgres` o `RDS`
- Storage:
  - `Cloudflare R2`
- DNS y proxy:
  - `Cloudflare`
- Caché y colas:
  - `Upstash Redis` o Redis administrado

### Ambientes

- `local`
- `staging`
- `production`

Nunca mezclar tenants reales de producción con staging.

### Flujo de despliegue

1. Push a rama feature.
2. Preview deployment automático.
3. Tests y linters.
4. Merge a rama principal.
5. Deploy a `staging` o directo a `production` según política.
6. Migraciones controladas de base de datos.
7. Smoke tests post deploy.

### Variables sensibles

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `WHATSAPP_DEFAULT_NUMBER`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `RESEND_API_KEY`
- `POSTHOG_KEY`
- `POSTHOG_HOST`
- claves de storage
- claves SMTP o email provider
- API keys de analytics

Estas variables no deben exponerse en cliente. Solo las variables públicas deben usar prefijo público.

### Despliegue de dominios

#### Subdominios de la plataforma

- Configurar wildcard:
  - `*.midominio.com`
- El frontend recibe cualquier subdominio y resuelve el tenant.

#### Dominios propios

- Registrar el hostname en el admin.
- Mostrar instrucciones DNS al tenant:
  - `CNAME`
  - o `A record` según proveedor
- Verificar propiedad.
- Emitir certificado TLS.
- Activar como dominio principal.

### Base de datos y migraciones

- Prisma migrations versionadas.
- Backup diario.
- Point-in-time recovery si el proveedor lo permite.
- Probar rollback antes de salir a producción.

### Storage e imágenes

- Buckets privados o con URLs firmadas cuando corresponda.
- CDN delante del storage.
- Optimización de imágenes en upload:
  - resize
  - compresión
  - webp/avif cuando convenga

### Observabilidad

- Logs centralizados.
- Monitoreo de errores:
  - `Sentry`
- Métricas:
  - tiempo de respuesta
  - errores 5xx
  - fallos de login
  - clics a WhatsApp
- eventos de producto y conversion:
  - `PostHog`
- Alertas por caída de dominio o expiración TLS.

### Checklist de salida a producción

- HTTPS forzado.
- CSP activa.
- Rate limiting activo.
- Backups verificados.
- Monitoreo y alertas activos.
- Dominios custom verificados.
- Robots, sitemap y metadatos SEO correctos.
- Política de privacidad y términos listos.

## 22. Decision final de stack

Con tus preferencias, la combinacion recomendada queda asi:

- Web publica y paneles:
  - `Next.js` + React
- API y logica de negocio:
  - `NestJS`
- Auth:
  - `Supabase Auth`
- Base de datos:
  - `PostgreSQL`
- ORM:
  - `Prisma`
- Archivos:
  - `Cloudflare R2`
- CDN y DNS:
  - `Cloudflare`
- Email:
  - `Resend`
- Product analytics:
  - `PostHog`

### Distribucion de responsabilidades

- `Next.js`
  - renderizado web
  - SEO
  - catalogo
  - dashboard UI
- `NestJS`
  - multi-tenancy
  - promociones
  - pedidos
  - webhooks
  - auditoria
  - integraciones
- `Supabase Auth`
  - identidad y sesiones
- `Cloudflare`
  - DNS
  - CDN
  - WAF
  - proxy
  - cache
- `R2`
  - media library
- `Resend`
  - correos transaccionales
- `PostHog`
  - embudos
  - eventos
  - adopcion de funciones

### Recomendacion operativa

Esta seleccion es coherente. Lo unico que vigilaria desde el inicio es:

- separar bien frontend y backend para no duplicar validaciones
- cerrar bien la integracion de `Supabase Auth` con roles por tenant
- optimizar imagenes antes de enviarlas a `R2`
- definir desde ya eventos de `PostHog`
- usar `Cloudflare` tambien para seguridad, no solo para CDN
