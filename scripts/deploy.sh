#!/bin/bash
set -e

# Load local .env file if present
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Ensure production environment for Next.js build and runtime
export NODE_ENV=production

echo "🚀 Preparing Opportunity AI for Production Deployment..."

# 1. Validate required environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL is not set."
  exit 1
fi

if [ -z "$JWT_SECRET" ]; then
  echo "⚠️ Warning: JWT_SECRET is not set. Generating a random fallback secret..."
  export JWT_SECRET=$(openssl rand -base64 32)
fi

# 2. Synchronize PostgreSQL database schema
echo "📦 Synchronizing Prisma database schema with PostgreSQL..."
npx prisma db push --skip-generate

# 3. Generate Prisma client
echo "⚙️ Generating Prisma Client..."
npx prisma generate

# 4. Seed verified database listings if needed
echo "🌱 Running verified opportunity seed script..."
npx tsx prisma/seed.ts || true

# 5. Build Next.js application
echo "🏗️ Building Next.js production bundle..."
npm run build

echo "✅ Opportunity AI is ready for production!"
echo "To start the production server, run: npm start"
