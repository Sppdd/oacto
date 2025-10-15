# Complete Setup Guide

Step-by-step instructions to get Chrome AI working in n8n.

## Prerequisites

### System Requirements
- **Operating System**: macOS 13+, Windows 10/11, ChromeOS, or Linux
- **RAM**: 8GB minimum (AI model needs ~2GB)
- **Storage**: 3GB free space
- **Node.js**: v18+ ([download here](https://nodejs.org))
- **Chrome**: Version 127+ or Chrome Canary

### Check Your Setup

```bash
# Check Node.js version
node --version  # Should be v18 or higher

# Check npm
npm --version
```

## Part 1: Enable Chrome AI

### Step 1: Check Chrome Version

```
1. Open Chrome
2. Go to: chrome://version/
3. Version should be 127 or higher
   - If not, download Chrome Canary
```

### Step 2: Enable AI Flags

```
1. Go to: chrome://flags
2. Search: "Prompt API for Gemini Nano"
3. Set to: Enabled
4. Search: "Enables optimization guide on device"
5. Set to: Enabled
6. (Optional for older hardware) "Bypass PerfRequirement" → Enabled
7. Click "Relaunch" button
```

### Step 3: Download AI Model

```
1. Go to: chrome://components/
2. Find: "Optimization Guide On Device Model"
3. Click: "Check for update"
4. Wait 5-10 minutes for ~1.5GB download
5. Version should change from "0.0.0.0" to a date
6. Restart Chrome when complete
```

### Step 4: Verify AI Works

```
1. Open any webpage
2. Press F12 (DevTools)
3. Go to Console tab
4. Type: window.ai
5. Should see an object (not undefined)

Test further:
const session = await window.ai.languageModel.create();
const result = await session.prompt("Say hello");
console.log(result);

Should output a greeting!
```

## Part 2: Install n8n

### Option 1: NPM (Recommended)

```bash
npm install -g n8n
n8n start
```

Access at: `http://localhost:5678`

### Option 2: Docker

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  n8nio/n8n
```

### Verify n8n

```
1. Open: http://localhost:5678
2. Create account (if first time)
3. You should see the n8n dashboard
```

## Part 3: Install Chrome AI Nodes

### Option A: From NPM (when published)

```bash
cd ~/.n8n/custom
npm install n8n-nodes-chrome-ai
```

### Option B: Local Development

```bash
# Clone or navigate to project
cd /Users/etharo/Desktop/Journal.dev

# Install and build
cd packages/n8n-nodes-chrome-ai
npm install
npm run build

# Link locally
npm link

# Link in n8n
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai

# Restart n8n
pkill n8n
n8n start
```

### Verify Nodes Installed

```
1. Open n8n: http://localhost:5678
2. Create new workflow
3. Click "+" to add node
4. Search: "Chrome"
5. Should see 7 Chrome AI nodes!
```

## Part 4: Start Bridge Server

```bash
cd /Users/etharo/Desktop/Journal.dev/packages/chrome-extension/server

# Install dependencies
npm install

# Start server
npm start
```

You should see:
```
🚀 Chrome AI Bridge Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HTTP Server: http://localhost:3333
🔌 WebSocket:   ws://localhost:3334
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Waiting for Chrome extension to connect...
```

**Leave this terminal open!** Server must run while using AI nodes.

## Part 5: Load Chrome Extension

### Step 1: Load in Chrome

```
1. Open Chrome
2. Go to: chrome://extensions/
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Navigate to: /Users/etharo/Desktop/Journal.dev/packages/chrome-extension
6. Click "Select"
```

### Step 2: Verify Connection

```
1. Click the extension icon in toolbar
2. Should show:
   - Bridge Server: ✅ Connected
   - Chrome AI: ✅ Available
```

If "Disconnected":
- Check bridge server is running
- Check terminal for errors
- Reload extension (chrome://extensions → refresh icon)

## Part 6: Configure n8n Credentials

### Create Chrome AI Credentials

```
1. Open n8n: http://localhost:5678
2. Click Settings (gear icon)
3. Click "Credentials"
4. Click "Add Credential"
5. Search: "Chrome AI"
6. Fill in:
   - Name: "Chrome AI Bridge"
   - Bridge URL: http://localhost:3333
   - API Key: (leave empty for now)
7. Click "Create"
```

### Test Connection

```
1. Click "Test"
2. Should show: ✅ "Connection successful"
```

If fails:
- Check bridge server is running
- Check extension is loaded and connected
- Verify URL is correct

## Part 7: Create Your First Workflow

### Simple Test Workflow

```
1. In n8n, click "+ Add workflow"
2. Add "Manual Trigger" node
3. Add "Chrome Prompt AI" node
4. Connect them
5. Configure Prompt AI:
   - Credentials: Select "Chrome AI Bridge"
   - User Prompt: "Write a haiku about automation"
   - Temperature: 0.8
6. Click "Execute Workflow"
7. Check output - you should see an AI-generated haiku!
```

### Import Example Workflows

```
1. Go to: /Users/etharo/Desktop/Journal.dev/examples/
2. Copy content of any .json file
3. In n8n: Workflows → Import from File
4. Paste JSON
5. Click Import
6. Execute!
```

## Troubleshooting

### "Bridge not responding"

**Check bridge server:**
```bash
# Terminal should show server running
# If not:
cd packages/chrome-extension/server
npm start
```

**Check extension:**
```
chrome://extensions/
- Extension should be enabled
- Click "service worker" to see logs
- Should show "Connected to bridge server"
```

### "AI not available"

```
1. chrome://components/
2. Optimization Guide version should NOT be "0.0.0.0"
3. If it is, click "Check for update" and wait
4. Restart Chrome when download completes
```

**Test manually:**
```javascript
// In any page console
window.ai.languageModel.create().then(s => s.prompt("hi"))
```

### Nodes don't appear in n8n

```bash
# Restart n8n completely
pkill n8n
n8n start

# Check if package is linked
cd ~/.n8n/custom
npm list
# Should show n8n-nodes-chrome-ai
```

### Port conflicts

```bash
# Check if ports are in use
lsof -i :3333
lsof -i :3334

# Kill if needed
kill -9 <PID>

# Restart bridge server
cd packages/chrome-extension/server
npm start
```

## Complete Startup Sequence

For daily use, start everything in this order:

```bash
# Terminal 1: Bridge Server
cd packages/chrome-extension/server
npm start

# Terminal 2: n8n
n8n start

# Chrome: Load extension (one-time)
chrome://extensions/ → Load unpacked

# You're ready!
# Create workflows at: http://localhost:5678
```

## Success Checklist

- [ ] Chrome version 127+
- [ ] AI flags enabled and Chrome restarted
- [ ] AI model downloaded (chrome://components/)
- [ ] window.ai works in console
- [ ] Bridge server running (port 3333)
- [ ] Extension loaded and connected
- [ ] n8n running (port 5678)
- [ ] Chrome AI nodes visible in n8n
- [ ] Credentials configured and tested
- [ ] Test workflow executes successfully

---

**All set?** You now have a complete local AI automation system! 🎉

See `README.md` for workflow examples and advanced usage.

