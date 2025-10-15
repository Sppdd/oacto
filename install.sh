#!/bin/bash

# Chrome AI × n8n Installation Script
# This script sets up the complete Chrome AI integration

set -e  # Exit on any error

echo "🚀 Chrome AI × n8n Installation"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -d "packages/n8n-nodes-chrome-ai" ]; then
    echo "❌ Error: Run this script from the project root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: Journal.dev/"
    exit 1
fi

echo "✅ Found project structure"
echo ""

# Step 1: Build n8n package
echo "📦 Building n8n package..."
cd packages/n8n-nodes-chrome-ai

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

echo "   Installing dependencies..."
npm install

echo "   Building TypeScript..."
npm run build

if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo "❌ Error: Build failed - dist/ directory is empty"
    exit 1
fi

echo "   Linking package globally..."
npm link

echo "✅ n8n package built and linked"
echo ""

# Step 2: Link in n8n
echo "🔗 Linking in n8n..."
echo "   Creating ~/.n8n/custom directory if it doesn't exist..."
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom

npm link n8n-nodes-chrome-ai

echo "✅ Package linked in n8n"
echo ""

# Step 3: Install bridge server dependencies
echo "🌉 Setting up bridge server..."
cd ../../packages/chrome-extension/server

if [ ! -f "package.json" ]; then
    echo "❌ Error: Bridge server package.json not found"
    exit 1
fi

npm install

echo "✅ Bridge server ready"
echo ""

# Step 4: Summary
echo "🎉 Installation Complete!"
echo "========================"
echo ""
echo "Next steps:"
echo "1. Start bridge server:"
echo "   cd packages/chrome-extension/server"
echo "   npm start"
echo ""
echo "2. Load Chrome extension:"
echo "   chrome://extensions/ → Load unpacked → packages/chrome-extension/"
echo ""
echo "3. Start n8n:"
echo "   n8n start"
echo ""
echo "4. Configure credentials in n8n:"
echo "   Settings → Credentials → Chrome AI API"
echo "   Bridge URL: http://localhost:3333"
echo ""
echo "5. Create your first workflow!"
echo ""
echo "📚 Documentation:"
echo "   - Quick start: QUICKSTART.md"
echo "   - Complete setup: docs/SETUP.md"
echo "   - Troubleshooting: docs/TROUBLESHOOTING.md"
echo ""
echo "Happy automating! 🤖"

