# syntax=docker/dockerfile:1.6

# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime

COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/telemed-ia-appointment-scheduling-portal/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/remoteEntry.json >/dev/null || exit 1