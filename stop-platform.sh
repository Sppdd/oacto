#!/bin/bash

# Chrome AI Automation Platform - Stop Script
# This script stops all running services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo ""
echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}Stopping Chrome AI Automation Platform...${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Stop processes by PID if available
if [ -f "logs/webapp.pid" ]; then
    WEBAPP_PID=$(cat logs/webapp.pid)
    if ps -p $WEBAPP_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping webapp server (PID: ${WEBAPP_PID})...${NC}"
        kill $WEBAPP_PID 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Webapp server stopped"
    fi
    rm logs/webapp.pid
fi

if [ -f "logs/n8n.pid" ]; then
    N8N_PID=$(cat logs/n8n.pid)
    if ps -p $N8N_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping n8n (PID: ${N8N_PID})...${NC}"
        kill $N8N_PID 2>/dev/null || true
        echo -e "${GREEN}✓${NC} n8n stopped"
    fi
    rm logs/n8n.pid
fi

# Kill any remaining processes on our ports
echo -e "${YELLOW}Cleaning up remaining processes...${NC}"
lsof -ti:3333 | xargs kill -9 2>/dev/null || true
lsof -ti:3334 | xargs kill -9 2>/dev/null || true
lsof -ti:5678 | xargs kill -9 2>/dev/null || true

echo ""
echo -e "${GREEN}✓ All services stopped${NC}"
echo ""
echo -e "${CYAN}To start again, run:${NC} ${GREEN}./start-platform.sh${NC}"
echo ""

