FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend ./
RUN npm run build

FROM caddy:2-alpine
COPY ./caddy/Caddyfile /etc/caddy/Caddyfile
COPY --from=frontend-builder /app/dist /srv
EXPOSE 80
EXPOSE 443
