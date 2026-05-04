# Multi Catalogo SaaS

Base inicial del proyecto para un sistema multi-tenant de catalogos con pedidos a WhatsApp.

## Stack

- `apps/web`: Next.js + React
- `apps/api`: NestJS
- `PostgreSQL + Prisma`
- `Supabase Auth`
- `Cloudflare R2`
- `Cloudflare CDN`
- `Resend`
- `PostHog`

## Estado actual

- Monorepo configurado con `pnpm`
- Frontend y backend compilando
- Schema Prisma multi-tenant listo
- Healthcheck en API
- Resolucion inicial de tenant por hostname
- Supabase helpers base en web y guard global en API
- Seed inicial preparado

## Arranque local

1. Instala dependencias:

```bash
pnpm install
```

2. Copia variables de entorno:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Configura Postgres en `apps/api/.env`.

4. Genera Prisma Client:

```bash
pnpm --dir apps/api exec prisma generate
```

5. Aplica migraciones o usa la migracion inicial:

```bash
pnpm --dir apps/api exec prisma migrate dev --name init
```

6. Carga seed demo:

```bash
pnpm --filter api db:seed
```

7. Levanta web y API:

```bash
pnpm dev
```

## Docker opcional

Si tienes Docker disponible, puedes levantar PostgreSQL con:

```bash
docker compose up -d
```

## Endpoints iniciales

- `GET /api/health`
- `GET /api/tenants/resolve?hostname=indumentaria-demo.midominio.local`

## Siguiente bloque recomendado

- CRUD tenant admin para categorias y productos
- Integracion completa con Supabase Auth
- Carrito y pedido a WhatsApp
- Media uploads a Cloudflare R2
- Promociones MVP en storefront y panel

