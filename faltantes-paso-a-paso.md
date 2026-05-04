# Faltantes Paso a Paso - Multi Catalogo SaaS

## Objetivo de este documento

Tener una lista clara, ordenada y accionable de todo lo que falta para pasar de la base actual a un sistema realmente listo para operar.

Este documento no describe la vision general. Describe lo pendiente real del proyecto hoy.

---

## Estado actual resumido

Ya existe:

- marketplace principal
- storefront tenant por subdominio
- panel superadmin base
- editor base por tenant
- CRUD basico de tenant, categorias, productos y promociones
- carrito persistente por tenant
- registro de pedido en base de datos
- salida a WhatsApp desde pedido

Todavia no existe un sistema cerrado, seguro y listo para clientes.

## Avance marcado

- [x] cerrar seguridad y auth
- [ ] cerrar panel admin real
- [ ] cerrar flujo comercial real
- [ ] cerrar branding y assets
- [ ] cerrar dominios custom
- [ ] cerrar observabilidad y operaciones
- [ ] cerrar despliegue productivo

---

## Orden correcto de ejecucion

No conviene atacar todo a la vez. Este es el orden recomendado:

1. cerrar seguridad y auth
2. cerrar panel admin real
3. cerrar flujo comercial real
4. cerrar branding y assets
5. cerrar dominios custom
6. cerrar observabilidad y operaciones
7. cerrar despliegue productivo

---

## Fase 1 - Auth y permisos reales

### 1.1 Integrar Supabase Auth de verdad en web

- [x] crear login real
- [x] crear logout real
- [x] manejar sesion server-side
- [x] proteger rutas `/dashboard`
- [x] ocultar acciones admin si no hay sesion

### 1.2 Integrar Supabase Auth de verdad en API

- [x] validar JWT de Supabase en backend
- [x] eliminar `@Public()` de endpoints admin sensibles
- [x] leer usuario autenticado en request
- [x] resolver memberships del usuario

### 1.3 Implementar roles reales

- [x] `SUPER_ADMIN`
- [ ] `TENANT_OWNER`
- [ ] `TENANT_STAFF`

### 1.4 Proteger acciones segun rol

- [x] solo `SUPER_ADMIN` puede crear, pausar o editar tenants globales
- [ ] `TENANT_OWNER` puede editar su tenant
- [ ] `TENANT_STAFF` puede operar catalogo, pero no branding critico ni dominios

### Definition of done

- [x] nadie sin login puede entrar al admin
- [ ] un owner no puede tocar otro tenant
- [ ] un staff no puede hacer acciones de owner

---

## Fase 2 - Panel admin real y completo

### 2.1 Completar superadmin

- [ ] alta de tenant desde UI
- [x] edicion completa de tenant
- [ ] cambiar estado: `ACTIVE`, `DRAFT`, `SUSPENDED`
- [x] cambiar plan
- [x] ver dominios configurados
- [x] ver actividad global

### 2.2 Completar tenant admin

- [ ] CRUD de banners
- [x] CRUD de categorias completo
- [x] CRUD de productos completo
- [x] CRUD de promociones completo
- [ ] tabla de pedidos
- [ ] cambio de estado de pedidos
- [x] branding completo

### 2.3 Mejorar UX del panel

- [x] tabs o secciones claras
- [x] feedback de guardado
- [ ] validaciones visibles
- [ ] confirmacion antes de borrar
- [ ] filtros, busqueda y paginacion

### Definition of done

- [ ] un tenant owner puede operar su tienda sin tocar DB ni codigo

---

## Fase 3 - Flujo comercial real

### 3.1 Cerrar carrito correctamente

- drawer/cart visible y estable
- contador correcto
- persistencia por tenant
- control de cantidades
- vaciar carrito
- eliminar item

### 3.2 Cerrar checkout a WhatsApp

- pedir nombre
- pedir telefono
- pedir email opcional
- guardar nota del cliente
- crear `quote_request`
- crear `quote_request_items`
- abrir WhatsApp con mensaje estructurado

### 3.3 Mostrar pedidos en admin

- listar solicitudes
- ver detalle de pedido
- cambiar estado:
  - `PENDING`
  - `SENT`
  - `VIEWED`
  - `CLOSED`

### 3.4 Aplicar stock basico

- validar stock > 0
- no permitir pedir cantidades absurdas
- marcar productos sin stock

### Definition of done

- el cliente puede armar pedido
- el pedido queda registrado
- el admin puede verlo y gestionarlo

---

## Fase 4 - Motor real de promociones

### 4.1 Aplicar promociones en storefront

- precio tachado
- precio final real
- badge visual
- bloque de ofertas activas

### 4.2 Aplicar promociones en carrito

- calcular precio con promo
- mostrar ahorro
- respetar vigencia
- respetar prioridad
- manejar `couponCode`

### 4.3 Soportar tipos MVP

- `PERCENTAGE`
- `FIXED_AMOUNT`
- `SPECIAL_PRICE`

### 4.4 Postergar por ahora

- `BUY_X_GET_Y` solo si queda estable

### Definition of done

- una promocion creada en admin afecta realmente precio en tienda y pedido

---

## Fase 5 - Branding real por tenant

### 5.1 Unificar tokens visuales

- marketplace
- storefront
- botones
- badges
- links
- bloques CTA

### 5.2 Hacer que todo lea branding del tenant

- `primaryColor`
- `secondaryColor`
- `logoUrl`
- `coverUrl`

### 5.3 Evitar colores hardcodeados donde no deben existir

- quitar dependencias visuales fijas en tienda
- dejar admin con identidad propia o parcialmente neutra

### Definition of done

- cambiar colores desde admin cambia la tienda completa de forma consistente

---

## Fase 6 - Media real con Cloudflare R2

### 6.1 Subida de archivos

- configurar bucket
- credenciales seguras
- upload seguro desde backend
- validacion MIME
- validacion de tamaño

### 6.2 Integrar en admin

- subir logo
- subir cover
- subir banners
- subir imagenes de producto

### 6.3 Entrega por CDN

- servir assets desde dominio/CDN correcto
- no usar URLs pegadas manualmente como flujo principal

### Definition of done

- el admin sube media sin pegar URLs
- los assets quedan persistidos y accesibles por CDN

---

## Fase 7 - Dominios custom reales

### 7.1 Modelo y panel

- crear dominio custom desde admin
- mostrar estado de verificacion
- marcar dominio principal

### 7.2 Verificacion

- instrucciones DNS
- validacion del registro requerido
- estado:
  - `PENDING`
  - `VERIFIED`
  - `FAILED`

### 7.3 Routing real

- resolver tenant por dominio custom en web
- resolver tenant por dominio custom en API
- mantener compatibilidad con subdominio

### 7.4 SSL y Cloudflare

- documentar configuracion real
- revisar proxy y cache

### Definition of done

- una tienda funciona tanto en `tenant.midominio.com` como en dominio propio

---

## Fase 8 - Seguridad seria

### 8.1 Seguridad de acceso

- proteger admin
- proteger mutaciones
- validar ownership por tenant
- cerrar endpoints hoy publicos

### 8.2 Seguridad de datos

- filtrar siempre por `tenantId`
- validar referencias cruzadas
- prevenir acceso a recursos de otro tenant

### 8.3 Seguridad web

- CSP
- headers de seguridad
- cookies seguras
- rate limiting
- auditoria de cambios

### 8.4 Secretos

- rotar claves sensibles compartidas en chat
- mover todos los secretos a env seguro

### Definition of done

- un tenant no puede tocar ni leer nada de otro
- el admin no es publico
- el proyecto tiene baseline aceptable de cybersec

---

## Fase 9 - Observabilidad y analitica

### 9.1 PostHog

- page view marketplace
- page view storefront
- view product
- add to cart
- start checkout
- checkout to WhatsApp
- login admin
- create product
- create promotion

### 9.2 Logs y errores

- logs de backend con contexto
- logs de errores en frontend
- trazabilidad de acciones admin

### Definition of done

- se puede medir uso, conversion y errores criticos

---

## Fase 10 - Resend

### 10.1 Correos operativos

- bienvenida al tenant
- aviso de nueva solicitud
- correo de soporte basico

### Definition of done

- el sistema envia correos utiles de negocio y operacion

---

## Fase 11 - Calidad y testing

### 11.1 Backend

- tests de servicios criticos
- tests de permisos
- tests de promociones
- tests de quote requests

### 11.2 Frontend

- smoke tests de rutas
- tests de carrito
- tests de formularios admin

### 11.3 QA manual

- checklist marketplace
- checklist storefront
- checklist admin
- checklist multi-tenant

### Definition of done

- cambios criticos no rompen silenciosamente

---

## Fase 12 - Despliegue real

### 12.1 Web

- deploy de `Next.js`
- variables por entorno
- dominio staging
- dominio production

### 12.2 API

- deploy de `NestJS`
- migraciones
- logs
- healthcheck

### 12.3 Infra

- `Cloudflare`
- `R2`
- `Supabase Auth`
- `PostHog`
- `Resend`

### 12.4 Operacion

- backups
- rollback
- monitoreo
- checklist release

### Definition of done

- se puede publicar y operar sin depender del entorno local

---

## Lista de pendientes inmediatos

Esto es lo que conviene hacer ya, en este orden:

1. cerrar auth real y quitar `@Public()` del admin
2. crear vista de pedidos en admin
3. aplicar promociones reales en carrito y storefront
4. terminar CRUD de banners
5. integrar uploads a R2
6. terminar dominios custom
7. meter PostHog y Resend
8. endurecer seguridad
9. preparar staging

---

## Checklist de cierre funcional

El sistema recien puede considerarse bien hecho cuando esto sea verdadero:

- el login funciona
- el admin no es publico
- cada tenant solo ve lo suyo
- los colores del tenant afectan toda la tienda
- el carrito registra pedidos reales
- los pedidos se gestionan en admin
- las promociones cambian precios reales
- el admin sube imagenes sin URLs manuales
- funcionan subdominios y dominios custom
- hay trazabilidad basica
- hay despliegue estable

---

## Nota importante

Hoy el proyecto ya tiene una base util, pero todavia esta en etapa de construccion funcional.

No se debe considerar listo para venta real hasta completar al menos:

- Fase 1
- Fase 3
- Fase 4
- Fase 8
- Fase 12
