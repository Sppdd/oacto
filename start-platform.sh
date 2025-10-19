#!/bin/bash

# Chrome AI Automation Platform - Startup Script
# This script starts all required services for the platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                           ║${NC}"
echo -e "${PURPLE}║         ${CYAN}Chrome AI Automation Platform${PURPLE}                  ║${NC}"
echo -e "${PURPLE}║         ${GREEN}Enterprise-Grade Local AI Workflows${PURPLE}           ║${NC}"
echo -e "${PURPLE}║                                                           ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Chrome AI is available
echo -e "${BLUE}[1/5]${NC} Checking Chrome AI availability..."
if command -v google-chrome-canary &> /dev/null || command -v chromium &> /dev/null; then
    echo -e "${GREEN}✓${NC} Chrome detected"
else
    echo -e "${YELLOW}⚠${NC}  Chrome not found. Please ensure Chrome Canary is installed."
fi

# Check Node.js
echo -e "${BLUE}[2/5]${NC} Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js ${NODE_VERSION} detected"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

# Check if n8n is installed
echo -e "${BLUE}[3/5]${NC} Checking n8n installation..."
if command -v n8n &> /dev/null; then
    N8N_VERSION=$(n8n --version 2>&1 | head -n 1)
    echo -e "${GREEN}✓${NC} n8n detected: ${N8N_VERSION}"
else
    echo -e "${YELLOW}⚠${NC}  n8n not found. Install with: npm install -g n8n"
fi

# Install webapp dependencies if needed
echo -e "${BLUE}[4/5]${NC} Checking webapp dependencies..."
cd webapp
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC}  Installing webapp dependencies..."
    npm install
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${GREEN}✓${NC} Dependencies already installed"
fi
cd ..

# Check if n8n nodes are built
echo -e "${BLUE}[5/5]${NC} Checking n8n nodes..."
cd packages/n8n-nodes-chrome-ai
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠${NC}  Building n8n nodes..."
    npm install
    npm run build
    npm link
    mkdir -p ~/.n8n/custom
    cd ~/.n8n/custom
    npm link n8n-nodes-chrome-ai
    cd -
    echo -e "${GREEN}✓${NC} n8n nodes built and linked"
else
    echo -e "${GREEN}✓${NC} n8n nodes already built"
fi
cd ../..

echo ""
echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ All checks passed!${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Start services
echo -e "${CYAN}Starting services...${NC}"
echo ""

# Kill any existing processes on our ports
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:3333 | xargs kill -9 2>/dev/null || true
lsof -ti:3334 | xargs kill -9 2>/dev/null || true
lsof -ti:5678 | xargs kill -9 2>/dev/null || true

# Start webapp server in background
echo -e "${BLUE}[1/2]${NC} Starting webapp server..."
cd webapp
npm start > ../logs/webapp.log 2>&1 &
WEBAPP_PID=$!
cd ..
echo -e "${GREEN}✓${NC} Webapp server started (PID: ${WEBAPP_PID})"
echo -e "      ${CYAN}HTTP:${NC}      http://localhost:3333"
echo -e "      ${CYAN}WebSocket:${NC} ws://localhost:3334"

# Wait for webapp to start
sleep 3

# Start n8n in background
echo -e "${BLUE}[2/2]${NC} Starting n8n..."
n8n start > logs/n8n.log 2>&1 &
N8N_PID=$!
echo -e "${GREEN}✓${NC} n8n started (PID: ${N8N_PID})"
echo -e "      ${CYAN}URL:${NC} http://localhost:5678"

# Wait for n8n to start
sleep 5

echo ""
echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Platform is running!${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo ""
echo -e "  1. Open Chrome and navigate to:"
echo -e "     ${GREEN}http://localhost:3333${NC}"
echo ""
echo -e "  2. Keep that tab open (minimize is fine)"
echo ""
echo -e "  3. Configure n8n credentials:"
echo -e "     - Open ${GREEN}http://localhost:5678${NC}"
echo -e "     - Add Chrome AI API credentials"
echo -e "     - Bridge URL: ${GREEN}http://localhost:3333${NC}"
echo ""
echo -e "  4. Start creating workflows!"
echo ""
echo -e "${YELLOW}Important:${NC} Keep the Chrome tab open for AI to work"
echo ""
echo -e "${CYAN}Logs:${NC}"
echo -e "  - Webapp: ${GREEN}logs/webapp.log${NC}"
echo -e "  - n8n:    ${GREEN}logs/n8n.log${NC}"
echo ""
echo -e "${CYAN}To stop the platform:${NC}"
echo -e "  Run: ${GREEN}./stop-platform.sh${NC}"
echo -e "  Or:  ${GREEN}kill ${WEBAPP_PID} ${N8N_PID}${NC}"
echo ""

# Save PIDs for stop script
mkdir -p logs
echo "${WEBAPP_PID}" > logs/webapp.pid
echo "${N8N_PID}" > logs/n8n.pid

# Open browser automatically (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${CYAN}Opening Chrome...${NC}"
    sleep 2
    open -a "Google Chrome" http://localhost:3333 2>/dev/null || \
    open http://localhost:3333 2>/dev/null || \
    echo -e "${YELLOW}⚠${NC}  Could not open browser automatically. Please open manually."
fi

echo -e "${GREEN}Happy automating! 🚀${NC}"
echo ""

# Keep script running and show logs
echo -e "${CYAN}Press Ctrl+C to stop all services${NC}"
echo ""
tail -f logs/webapp.log logs/n8n.log

