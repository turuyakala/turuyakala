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
echo "1. Setup database:"
echo "   npm run db:generate"
echo "   npm run db:push"
echo "   npm run db:seed"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "📖 For more details, see:"
echo "   - README.md (full documentation)"
echo ""

