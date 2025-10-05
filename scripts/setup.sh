#!/bin/bash

# LastMinuteTour Setup Script
# This script helps you set up the project quickly

set -e

echo "🎯 LastMinuteTour Setup"
echo "======================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm $(npm -v) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo ""
    echo "🔧 Creating .env.local file..."
    cp .env.local.example .env.local
    echo "✅ .env.local created. Please edit it with your configuration."
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo ""
echo "Option 1: Run frontend only (fastest)"
echo "  npm run dev:next"
echo ""
echo "Option 2: Run with Docker (full stack)"
echo "  docker-compose up -d"
echo ""
echo "Option 3: Run everything manually"
echo "  1. Start PostgreSQL and Redis:"
echo "     docker-compose up -d postgres redis"
echo "  2. Setup database:"
echo "     npm run prisma:generate"
echo "     npm run prisma:migrate"
echo "     npm run prisma:seed"
echo "  3. Start both servers:"
echo "     npm run dev"
echo ""
echo "📖 For more details, see:"
echo "   - QUICKSTART.md (quick start guide)"
echo "   - README.md (full documentation)"
echo ""

