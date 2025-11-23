#!/bin/bash
set -e

echo "🚀 Setting up Mermaid ReactFlow Platform..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️  Setting up database..."
npm run db:migrate
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Default login credentials:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "Open http://localhost:3000 in your browser"
