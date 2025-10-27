#!/bin/bash

# Chrome AI × n8n - Stop Script
# Stops all running services

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}Stopping Chrome AI × n8n...${NC}"
echo ""

# Stop by PID
if [ -f "logs/webapp.pid" ]; then
    WEBAPP_PID=$(cat logs/webapp.pid)
    if ps -p $WEBAPP_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping Bridge Server (PID: ${WEBAPP_PID})...${NC}"
        kill $WEBAPP_PID 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Bridge Server stopped"
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

# Clean up ports
echo -e "${YELLOW}Cleaning up ports...${NC}"
lsof -ti:3333 | xargs kill -9 2>/dev/null || true
lsof -ti:3334 | xargs kill -9 2>/dev/null || true
lsof -ti:5678 | xargs kill -9 2>/dev/null || true

echo ""
echo -e "${GREEN}✓ All services stopped${NC}"
echo ""
echo -e "${CYAN}Start again: ./start-platform.sh${NC}"
echo ""
