FROM node:22-alpine AS base
RUN npm install -g pnpm@10

# ── Dependencies ──────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod=false

# ── Prisma Generate ──────────────────────────────────
FROM deps AS prisma
COPY prisma ./prisma
RUN npx prisma generate

# ── Build ────────────────────────────────────────────
FROM prisma AS build
COPY . .
RUN pnpm run build

# ── Production ───────────────────────────────────────
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json

EXPOSE 4000

CMD ["node", "dist/main"]
