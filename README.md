# TechStore

Production-ready full-stack electronics e-commerce store.

## Services
- Backend: NestJS + Prisma
- Frontend: React (Vite) + TailwindCSS
- Database: PostgreSQL
- Reverse proxy: Caddy

## Features
- Product catalog with categories
- Shopping cart and checkout
- Order management with status tracking
- Admin panel for product/category/order management
- Telegram bot notifications for new orders
- Image upload for products
- User authentication and authorization

## Quick Start
1. Copy root and backend env files and edit secrets.
2. Start services with Docker Compose.

## Environment
Create .env and backend/.env from the examples and update values.

Root .env keys:
- POSTGRES_DB
- POSTGRES_USER
- POSTGRES_PASSWORD
- DOMAIN
- ACME_EMAIL

Backend .env keys:
- DATABASE_URL
- JWT_SECRET
- TELEGRAM_BOT_TOKEN
- TELEGRAM_ADMIN_CHAT
- ADMIN_EMAIL

## Run
```bash
docker compose up --build
```

Backend runs on port 3000 (proxied via Caddy).
Frontend runs on port 80 via Caddy.

## HTTPS (Let's Encrypt)
1. Point your domain to the VPS public IP.
2. Ensure ports 80 and 443 are open.
3. Caddy will obtain and renew certificates automatically.
