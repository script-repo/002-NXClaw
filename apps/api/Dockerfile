# Build from repo root: docker build -f apps/api/Dockerfile -t nxclaw-api:latest .
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api apps/api
RUN npm ci
WORKDIR /app/apps/api
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
EXPOSE 3000
ENV PORT=3000
CMD ["node", "dist/index.js"]
