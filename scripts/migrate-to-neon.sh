#!/bin/bash
# Neon Database Migration Script

set -e

echo "🚀 LevelUp Neon Database Migration"
echo "=================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Loading from .env.neon..."
    export $(grep -v '^#' .env.neon | xargs)
fi

echo "📍 Database: Neon PostgreSQL (Singapore)"
echo "🔗 Host: ep-noisy-forest-a148nhkt.ap-southeast-1.aws.neon.tech"

# Install Prisma if not present
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Backup current schema
echo "📦 Backing up current schema..."
cp prisma/schema.prisma prisma/schema.sqlite.prisma 2>/dev/null || true
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Push schema to database
echo "⬆️  Pushing schema to Neon..."
npx prisma db push --accept-data-loss

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed 2>/dev/null || echo "⚠️  No seed script configured"

echo ""
echo "✅ Migration complete!"
echo ""
echo "📊 Database Stats:"
npx prisma studio &
echo "🎨 Prisma Studio opened at http://localhost:5555"
