#!/bin/bash

# Chrome AI × n8n - Start Script
# Starts the Bridge Server and n8n

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  Chrome AI × n8n Integration${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""

# Check Node.js
echo -e "${BLUE}[1/4]${NC} Checking Node.js..."
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js $(node -v)"
else
    echo -e "${YELLOW}✗${NC} Node.js not found. Install Node.js 16+ first."
    exit 1
fi

# Check n8n
echo -e "${BLUE}[2/4]${NC} Checking n8n..."
if command -v n8n &> /dev/null; then
    echo -e "${GREEN}✓${NC} n8n installed"
else
    echo -e "${YELLOW}⚠${NC}  n8n not found. Install: npm install -g n8n"
fi

# Install webapp dependencies
echo -e "${BLUE}[3/4]${NC} Checking webapp dependencies..."
cd webapp
if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install
fi
echo -e "${GREEN}✓${NC} Dependencies ready"
cd ..

# Check n8n nodes
echo -e "${BLUE}[4/4]${NC} Checking n8n nodes..."
cd packages/n8n-nodes-chrome-ai
if [ ! -d "dist" ]; then
    echo "  Building nodes..."
    npm install
    npm run build
    npm link
    mkdir -p ~/.n8n/custom
    cd ~/.n8n/custom
    npm link n8n-nodes-chrome-ai
    cd -
fi
echo -e "${GREEN}✓${NC} n8n nodes ready"
cd ../..

echo ""
echo -e "${GREEN}✓ All checks passed${NC}"
echo ""

# Clean up existing processes
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
lsof -ti:3333 | xargs kill -9 2>/dev/null || true
lsof -ti:3334 | xargs kill -9 2>/dev/null || true
lsof -ti:5678 | xargs kill -9 2>/dev/null || true

# Create logs directory
mkdir -p logs

# Start webapp server
echo -e "${BLUE}[1/2]${NC} Starting Bridge Server..."
cd webapp
npm start > ../logs/webapp.log 2>&1 &
WEBAPP_PID=$!
cd ..
echo -e "${GREEN}✓${NC} Bridge Server (PID: ${WEBAPP_PID})"
echo "      URL: http://localhost:3333"

# Wait for webapp
sleep 3

# Start n8n
echo -e "${BLUE}[2/2]${NC} Starting n8n..."
n8n start > logs/n8n.log 2>&1 &
N8N_PID=$!
echo -e "${GREEN}✓${NC} n8n (PID: ${N8N_PID})"
echo "      URL: http://localhost:5678"

# Wait for n8n
sleep 5

echo ""
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Platform is running!${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo ""
echo "  1. Open Chrome: ${GREEN}http://localhost:3333${NC}"
echo "  2. Keep that tab open (can minimize)"
echo "  3. Open n8n: ${GREEN}http://localhost:5678${NC}"
echo "  4. Add Chrome AI credentials"
echo "  5. Create workflows!"
echo ""
echo -e "${YELLOW}Important:${NC} Keep the Chrome tab open"
echo ""
echo -e "${CYAN}Logs:${NC}"
echo "  - Bridge: logs/webapp.log"
echo "  - n8n:    logs/n8n.log"
echo ""
echo -e "${CYAN}Stop:${NC} ./stop-platform.sh"
echo ""

# Save PIDs
echo "${WEBAPP_PID}" > logs/webapp.pid
echo "${N8N_PID}" > logs/n8n.pid

# Open browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    sleep 2
    open -a "Google Chrome" http://localhost:3333 2>/dev/null || \
    open http://localhost:3333 2>/dev/null || true
fi

echo -e "${CYAN}Press Ctrl+C to stop${NC}"
echo ""

# Show logs
tail -f logs/webapp.log logs/n8n.log
