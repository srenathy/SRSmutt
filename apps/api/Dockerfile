# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configs
COPY package.json tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install dependencies and build shared + api
RUN npm install
RUN npm run build:shared
RUN npm --workspace apps/api run prisma:generate
RUN npm --workspace apps/api run build

# Stage 2: Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built outputs and packages
COPY package.json tsconfig.base.json ./
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

CMD ["npm", "--workspace", "apps/api", "run", "start"]
