#!/bin/bash

# Chrome AI × n8n Installation Script
# Sets up the complete Chrome AI integration

set -e

echo ""
echo "🚀 Chrome AI × n8n Installation"
echo "================================"
echo ""

# Check directory
if [ ! -d "packages/n8n-nodes-chrome-ai" ]; then
    echo "❌ Error: Run from project root"
    echo "   Current: $(pwd)"
    exit 1
fi

echo "✅ Project structure found"
echo ""

# Build n8n nodes
echo "📦 Building n8n nodes..."
cd packages/n8n-nodes-chrome-ai

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

echo "   Installing dependencies..."
npm install

echo "   Building TypeScript..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

echo "   Linking package globally..."
npm link

echo "✅ n8n nodes built"
echo ""

# Link in n8n
echo "🔗 Linking in n8n..."
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai
echo "✅ Linked in n8n"
echo ""

# Setup webapp
echo "🌉 Setting up Bridge Server..."
cd ~/Desktop/Journal.dev/webapp  # Adjust if needed

if [ ! -f "package.json" ]; then
    echo "❌ Error: webapp package.json not found"
    exit 1
fi

npm install
echo "✅ Bridge Server ready"
echo ""

# Summary
echo "🎉 Installation Complete!"
echo "========================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the platform:"
echo "   ./start-platform.sh"
echo ""
echo "2. Open Chrome:"
echo "   http://localhost:3333"
echo "   (Keep this tab open)"
echo ""
echo "3. Open n8n:"
echo "   http://localhost:5678"
echo ""
echo "4. Configure credentials:"
echo "   - Settings → Credentials"
echo "   - Add Chrome AI API"
echo "   - Bridge URL: http://localhost:3333"
echo ""
echo "5. Create workflows!"
echo ""
echo "📚 Documentation:"
echo "   - README.md           - Overview"
echo "   - QUICKSTART.md       - Quick start"
echo "   - docs/HOW-IT-WORKS.md - How it works"
echo ""
echo "Happy automating! 🚀"
echo ""
