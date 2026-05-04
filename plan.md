# Plan de ejecucion - Multi catalogo SaaS con pedidos por WhatsApp

## 1. Objetivo

Construir una plataforma multi-tenant para catalogos de productos con:

- subdominios por empresa: `empresa1.midominio.com`
- dominio propio por empresa
- catalogo web responsive
- panel tenant admin
- panel superadmin
- carrito con salida a WhatsApp
- sistema de promociones
- seguridad multiempresa
- despliegue productivo sobre `Next.js + NestJS + Supabase Auth + PostgreSQL + Prisma + Cloudflare + Resend + PostHog`

## 2. Alcance del MVP

El MVP debe permitir:

- crear tenants
- resolver tenant por subdominio
- login y sesiones con `Supabase Auth`
- administrar productos, categorias y banners
- publicar catalogo por tenant
- agregar productos al carrito
- generar pedido hacia WhatsApp
- crear promociones simples
- tener trazabilidad basica de eventos
- operar con panel superadmin y panel tenant admin

Queda fuera del MVP inicial:

- dominio propio autoasistido completo
- sucursales avanzadas
- stock complejo
- cupones avanzados y reglas promocionales complejas
- builder visual de landing
- automatizaciones con IA

## 3. Principios de implementacion

- Multi-tenant real desde el dia 1.
- Separacion clara entre frontend, backend, auth y storage.
- Ningun dato debe cruzarse entre tenants.
- Sin emojis en la interfaz. Solo iconos.
- Primero arquitectura y seguridad, luego velocidad.
- Todo lo importante debe quedar medible.
- El diseño publico y admin debe ser mejor que el sistema de referencia, no una copia.

## 4. Stack confirmado

- Frontend: `Next.js` + React
- Backend: `NestJS`
- Auth: `Supabase Auth`
- Base de datos: `PostgreSQL`
- ORM: `Prisma`
- Storage: `Cloudflare R2`
- CDN / DNS / proxy / WAF: `Cloudflare`
- Email: `Resend`
- Analitica: `PostHog`
- Cache y colas: `Redis` o `Upstash Redis`

## 5. Arquitectura objetivo

### Frontend `Next.js`

- storefront publico multi-tenant
- panel tenant admin
- panel superadmin
- SEO y renderizado server-side

### Backend `NestJS`

- API de negocio
- resolucion y validacion de tenant
- catalogo
- promociones
- pedidos
- dominios
- uploads
- auditoria
- webhooks e integraciones

### Servicios externos

- `Supabase Auth`: autenticacion
- `Cloudflare R2`: imagenes y media
- `Cloudflare`: CDN, DNS, proxy, seguridad
- `Resend`: correos transaccionales
- `PostHog`: eventos y embudos

## 6. Fases de ejecucion

## Fase 0 - Base tecnica

Objetivo:
dejar el monorepo o estructura inicial lista para desarrollar sin rehacer cimientos.

Entregables:

- repositorio base con `web` y `api`
- configuracion de `Next.js`
- configuracion de `NestJS`
- `Prisma` conectado a `PostgreSQL`
- integracion inicial con `Supabase Auth`
- estructura de carpetas comun
- variables de entorno documentadas
- convenciones de codigo y lint

Definition of done:

- la app web levanta local
- la API levanta local
- hay conexion a base de datos
- existe primer healthcheck

## Fase 1 - Multi-tenancy y auth

Objetivo:
resolver correctamente empresa, usuarios y permisos.

Entregables:

- modelo `tenants`
- modelo `domains`
- modelo `users` y `memberships`
- resolucion por subdominio
- middleware o capa de request con tenant actual
- RBAC base:
  - `super_admin`
  - `tenant_owner`
  - `tenant_staff`
- login con `Supabase Auth`
- guardas de autorizacion en `NestJS`

Definition of done:

- `empresa1.localhost` o equivalente carga tenant correcto
- un usuario de tenant no puede ver datos de otro tenant
- un `super_admin` puede acceder a consola global

## Fase 2 - Catalogo base

Objetivo:
tener catalogo funcional por tenant.

Entregables:

- categorias
- productos
- imagenes de producto
- banners
- temas basicos por tenant
- listado publico
- detalle de producto
- busqueda y filtros iniciales
- carga de media a `Cloudflare R2`

Definition of done:

- un tenant puede crear catalogo completo
- el publico puede navegar tienda, categoria y producto
- las imagenes se sirven desde CDN

## Fase 3 - Pedido a WhatsApp

Objetivo:
cerrar el flujo comercial minimo.

Entregables:

- carrito en frontend
- cantidades
- variantes basicas
- notas del cliente
- generacion de mensaje estructurado
- link hacia WhatsApp
- guardado de intento de pedido en base de datos
- eventos de conversion en `PostHog`

Definition of done:

- un usuario puede agregar productos y salir a WhatsApp
- el pedido queda registrado internamente
- se mide click y conversion iniciada

## Fase 4 - Panel tenant admin

Objetivo:
dar autonomia real al negocio.

Entregables:

- dashboard tenant
- CRUD de productos
- CRUD de categorias
- CRUD de banners
- configuracion de WhatsApp
- configuracion visual basica
- tabla de pedidos o solicitudes
- auditoria basica de acciones

Definition of done:

- el owner del tenant administra su catalogo sin soporte tecnico

## Fase 5 - Panel superadmin

Objetivo:
operar la plataforma a nivel SaaS.

Entregables:

- dashboard global
- alta y baja de tenants
- gestion de dominios
- vista de planes y estados
- metricas globales
- vista de actividad

Definition of done:

- se puede dar de alta una empresa completa desde panel
- se puede suspender o reactivar tenant

## Fase 6 - Promociones MVP

Objetivo:
hacer vendible el catalogo con campañas reales.

Entregables:

- promociones por producto
- promociones por categoria
- vigencia por fecha
- precio tachado y precio promocional
- badges de oferta con iconos, no emojis
- seccion de ofertas en storefront
- tracking de promociones en `PostHog`

Definition of done:

- un tenant puede activar una promocion y verla reflejada en web y pedido

## Fase 7 - Seguridad y endurecimiento

Objetivo:
cerrar riesgos antes de abrir a clientes reales.

Entregables:

- validacion de input en servidor
- rate limiting
- CSP y headers de seguridad
- logs de auditoria
- subida segura de archivos
- filtros estrictos por `tenant_id`
- proteccion de rutas admin
- manejo seguro de secretos

Definition of done:

- se ejecuta checklist de seguridad base
- los endpoints sensibles quedan protegidos

## Fase 8 - Despliegue y operacion

Objetivo:
tener salida a staging y produccion.

Entregables:

- entorno `staging`
- entorno `production`
- despliegue de web
- despliegue de API
- pipeline de migraciones
- storage operativo en `R2`
- `Cloudflare` configurado
- `Resend` operativo
- `PostHog` operativo
- monitoreo y alertas

Definition of done:

- la plataforma publica y admin funcionan en entorno desplegado
- existe rollback basico y backup documentado

## 7. Orden real de construccion

No construir todo en paralelo. El orden recomendado es:

1. estructura del repositorio
2. `Next.js` y `NestJS`
3. `Prisma` y modelos base
4. `Supabase Auth`
5. multi-tenancy
6. catalogo
7. uploads a `R2`
8. carrito y WhatsApp
9. panel tenant admin
10. panel superadmin
11. promociones
12. seguridad final
13. despliegue

## 8. Modelos de datos prioritarios

Estos van primero:

- `tenants`
- `domains`
- `users`
- `memberships`
- `categories`
- `products`
- `product_images`
- `banners`
- `quote_requests`
- `quote_request_items`

Estos van despues:

- `promotions`
- `promotion_rules`
- `coupons`
- `theme_settings`
- `analytics_events`

## 9. Seguridad obligatoria desde el inicio

- todas las consultas filtradas por `tenant_id`
- ids publicos no secuenciales
- validacion con DTOs y schemas
- autorizacion por rol
- rate limit para login y endpoints criticos
- control de MIME y tamano en uploads
- secretos fuera del repo
- HTTPS en todos los entornos expuestos
- sin acceso directo a buckets
- logs de auditoria para cambios sensibles

## 10. Criterios de UI/UX

- sin emojis
- solo iconos del sistema visual
- storefront mas limpio y premium que la referencia
- admin mas claro y menos cargado que la referencia
- responsive real, no adaptacion forzada
- foco en conversion a WhatsApp
- foco en rendimiento y legibilidad

## 11. Analitica minima

Eventos minimos a medir con `PostHog`:

- visita a home tenant
- vista de categoria
- vista de producto
- agregar al carrito
- iniciar pedido WhatsApp
- promocion vista
- promocion aplicada
- login admin
- alta de producto

## 12. Entregables de la semana 1

Semana 1 debe cerrar esto:

- estructura inicial del proyecto
- `Next.js` funcionando
- `NestJS` funcionando
- `Prisma` configurado
- primer esquema de base de datos
- autenticacion conectada
- modelo `tenants` y `domains`
- healthcheck y primer endpoint seguro

## 13. Entregables de la semana 2

- resolucion por subdominio
- panel base autenticado
- CRUD de categorias
- CRUD de productos
- carga basica de imagenes
- storefront tenant con listado de productos

## 14. Entregables de la semana 3

- carrito
- pedido a WhatsApp
- registro de solicitudes
- dashboard tenant base
- eventos de `PostHog`

## 15. Entregables de la semana 4

- promociones MVP
- dashboard superadmin base
- endurecimiento de seguridad
- primer deploy a `staging`

## 16. Riesgos de ejecucion

- mala separacion tenant y fuga de datos
- duplicar logica entre frontend y backend
- improvisar dominios custom demasiado pronto
- no optimizar imagenes y disparar costos de `R2`
- dejar la seguridad para el final
- construir demasiadas features antes de validar el flujo comercial

## 17. Definicion de exito del MVP

El MVP es exitoso si:

- una empresa puede operar su catalogo sin ayuda tecnica
- el publico puede navegar y pedir por WhatsApp sin friccion
- los datos quedan aislados por tenant
- se puede medir uso y conversion
- el sistema se despliega con seguridad y estabilidad basicas

## 18. Siguiente paso inmediato

Empezar por:

1. crear estructura del proyecto
2. inicializar `web` con `Next.js`
3. inicializar `api` con `NestJS`
4. preparar `Prisma`
5. modelar `tenants`, `domains`, `memberships`

## 19. Decision de arranque

Vamos a trabajar primero sobre la base tecnica y multi-tenancy.

No se debe empezar por el diseño visual final ni por promociones avanzadas.
Primero hay que asegurar:

- estructura
- auth
- tenant resolution
- catalogo base
- pedido a WhatsApp
