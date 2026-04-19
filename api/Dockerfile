# Stage 1: Base & Dependencies
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Builder
FROM base AS builder
WORKDIR /app
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

# Add a non-root user for security
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
USER nextjs

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# We use the build artifact in dist/server.js
CMD ["node", "dist/server.js"]
