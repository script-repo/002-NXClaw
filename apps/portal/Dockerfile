# Build from repo root: docker build -f apps/portal/Dockerfile -t nxclaw-portal:latest .
FROM node:20-alpine AS builder
WORKDIR /app
# Workspace root
COPY package.json package-lock.json* ./
COPY packages/ui packages/ui
COPY apps/portal apps/portal
RUN npm install
RUN npm run build --workspace=@nxclaw/ui --if-present
WORKDIR /app/apps/portal
ENV VITE_API_URL=
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/apps/portal/dist /usr/share/nginx/html
COPY apps/portal/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
