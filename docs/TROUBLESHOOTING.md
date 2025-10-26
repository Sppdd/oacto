# Troubleshooting Guide

Solutions to common issues with Chrome AI × n8n integration.

## Quick Diagnostics

Run this checklist first:

```bash
# 1. Check Chrome version
# Open chrome://version/ - should be 127+

# 2. Check bridge server
curl http://localhost:3333/api/health
# Should return: {"status": "ok"}

# 3. Check n8n
curl http://localhost:5678/healthz
# Should return health status

# 4. Check extension
# Click extension icon - should show "Connected"

# 5. Check AI
# Console: window.ai
# Should return object
```

## Problem: "Bridge not responding"

### Symptoms
- n8n node shows error: "Chrome AI bridge is not responding"
- Health check fails

### Solutions

**1. Start bridge server:**
```bash
cd packages/chrome-extension/server
npm install  # if first time
npm start
```

**2. Check if running:**
```bash
# macOS/Linux
lsof -i :3333

# Should show node process
```

**3. Check for port conflicts:**
```bash
# Kill process if port in use
lsof -i :3333
kill -9 <PID>

# Restart bridge
npm start
```

**4. Check logs:**
```
Terminal running bridge should show:
📡 HTTP Server: http://localhost:3333
✅ Chrome Extension connected
```

## Problem: "Chrome extension not connected"

### Symptoms
- Bridge shows: "Waiting for Chrome extension to connect..."
- Extension popup shows "Disconnected"

### Solutions

**1. Load extension:**
```
1. chrome://extensions/
2. Developer mode ON
3. Load unpacked → packages/chrome-extension/
```

**2. Check extension status:**
```
chrome://extensions/
- Find "Chrome AI Bridge for n8n"
- Should be enabled (toggle ON)
- No errors shown
```

**3. Check service worker:**
```
chrome://extensions/
- Click "service worker"
- Console should show:
  "Chrome AI Bridge service worker loaded"
  "✅ Connected to bridge server"
```

**4. Reload extension:**
```
chrome://extensions/
- Click refresh icon on extension
- Check console again
```

**5. Check WebSocket:**
```javascript
// In service worker console
// Should see WebSocket connection to ws://localhost:3334
```

## Problem: "AI not available"

### Symptoms
- Extension popup shows "Chrome AI: Not available"
- Content script error: "Chrome AI APIs not available"

### Solutions

**1. Enable Chrome flags:**
```
chrome://flags
Search: "Prompt API for Gemini Nano"
Enable + Restart Chrome
```

**2. Download AI model:**
```
chrome://components/
Find: "Optimization Guide On Device Model"
Click: "Check for update"
Wait 5-10 minutes
Restart Chrome
```

**3. Verify model downloaded:**
```
chrome://components/
"Optimization Guide On Device Model"
Version should NOT be "0.0.0.0"
Should be a date like "2024.10.15.xxx"
```

**4. Test manually:**
```javascript
// In any page console (F12)
window.ai
// Should return object

await window.ai.languageModel.capabilities()
// Should return {available: "readily"}

const session = await window.ai.languageModel.create()
await session.prompt("test")
// Should return text
```

**5. Clear Chrome cache:**
```
chrome://settings/clearBrowserData
- Cached images and files
- Clear
- Restart Chrome
```

## Problem: Nodes don't appear in n8n

### Symptoms
- Can't find "Chrome" nodes in n8n
- Search returns no results

### Solutions

**1. Install package:**
```bash
cd packages/n8n-nodes-chrome-ai
npm install
npm run build
npm link

cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai
```

**2. Restart n8n:**
```bash
# Kill all n8n processes
pkill n8n

# Start fresh
n8n start
```

**3. Check package installed:**
```bash
cd ~/.n8n/custom
npm list
# Should show n8n-nodes-chrome-ai@1.0.0
```

**4. Check n8n logs:**
```
Terminal running n8n should show:
"Loading nodes from: ~/.n8n/custom/node_modules"
```

**5. Verify build:**
```bash
cd packages/n8n-nodes-chrome-ai
ls dist/
# Should show compiled .js files
```

## Problem: Workflow execution fails

### Symptoms
- Workflow starts but errors immediately
- "Execution failed" message

### Solutions

**1. Check credentials:**
```
n8n → Settings → Credentials
- Select "Chrome AI Bridge"
- Click "Test"
- Should succeed
```

**2. Check all services running:**
```
✓ Bridge server (port 3333)
✓ n8n (port 5678)
✓ Chrome with extension loaded
✓ AI model downloaded
```

**3. Check workflow configuration:**
- All Chrome AI nodes have credentials selected
- Prompts are not empty
- Parameters are valid

**4. Test simple workflow first:**
```
Manual Trigger → Chrome Prompt AI ("Say hi")
```

**5. Check execution logs:**
```
n8n → Executions
- Click failed execution
- Check error message
- Look for specific node that failed
```

## Problem: Slow performance

### Symptoms
- Requests take > 10 seconds
- Timeouts occur frequently

### Solutions

**1. Simplify prompts:**
```
Too long: "Write a 5-page essay about..."
Better: "Write 3 paragraphs about..."
```

**2. Close unnecessary tabs:**
```
Chrome AI shares resources
Fewer tabs = faster inference
```

**3. Check system resources:**
```
# macOS
Activity Monitor → Chrome memory usage

# Should have 4GB+ free RAM
```

**4. Reduce temperature:**
```
Lower temperature = faster (but less creative)
Try 0.3 instead of 1.5
```

**5. Use appropriate AI node:**
```
For summaries: Use Summarizer (not Prompt AI)
For translation: Use Translator (not Prompt AI)
Specialized nodes are optimized
```

## Problem: Connection drops

### Symptoms
- Extension shows "Disconnected" randomly
- Workflows fail mid-execution

### Solutions

**1. Keep bridge server running:**
```
Don't close terminal running npm start
Run as background service (systemd/launchd)
```

**2. Check network:**
```
# Test localhost connectivity
ping localhost
curl http://localhost:3333/api/health
```

**3. Check firewall:**
```
Ensure localhost traffic allowed
Disable VPN if causing issues
```

**4. Auto-reconnect:**
```
Extension auto-reconnects every 5 seconds
Wait and check popup again
```

## Problem: TypeScript errors in n8n nodes

### Symptoms
- Build fails
- npm run build shows errors

### Solutions

**1. Install dependencies:**
```bash
cd packages/n8n-nodes-chrome-ai
rm -rf node_modules
npm install
```

**2. Check TypeScript version:**
```bash
npm list typescript
# Should be 5.0+
```

**3. Clean build:**
```bash
rm -rf dist
npm run build
```

**4. Check tsconfig.json:**
```
Should have proper paths
No syntax errors
```

## Problem: Extension manifest errors

### Symptoms
- Extension won't load
- chrome://extensions/ shows errors

### Solutions

**1. Check manifest.json:**
```
Valid JSON (no trailing commas)
All required fields present
File paths correct
```

**2. Check file structure:**
```bash
ls packages/chrome-extension/
# Should show: background/, content/, popup/, server/
```

**3. Reload extension:**
```
chrome://extensions/
- Toggle OFF and ON
- Or click refresh icon
```

## Advanced Debugging

### Enable Debug Mode

**Bridge Server:**
```javascript
// Add to server.js
app.use((req, res, next) => {
  console.log('[DEBUG]', req.method, req.path, req.body);
  next();
});
```

**Extension:**
```javascript
// In service-worker.js
console.log('[DEBUG] Message received:', message);
console.log('[DEBUG] Response:', response);
```

### Monitor WebSocket

Use browser DevTools:
```
1. Open page with extension active
2. F12 → Network tab
3. Filter: WS
4. See WebSocket frames
```

### Check n8n Database

```bash
# SQLite database location
~/.n8n/database.sqlite

# Check workflows
sqlite3 ~/.n8n/database.sqlite
SELECT * FROM workflow_entity;
```

## Getting Help

### Collect Debug Info

Before asking for help, collect:

```
1. Chrome version (chrome://version/)
2. AI status (chrome://components/)
3. Bridge server logs
4. Extension console logs
5. n8n execution logs
6. Error messages
```

### GitHub Issues

When reporting issues:
1. Describe expected vs actual behavior
2. Include debug info above
3. Show workflow JSON
4. Show error messages

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "ETIMEDOUT" | Bridge not running | Start bridge server |
| "ECONNREFUSED" | Wrong port | Check bridge URL |
| "AI not available" | Flags not enabled | Enable in chrome://flags |
| "Model not downloaded" | No model | Download from chrome://components/ |
| "No active tab" | Chrome closed | Open Chrome |
| "Session creation failed" | AI busy | Retry or simplify prompt |
| "Requires a user gesture" | Writer API limitation | Use Prompt AI instead |

## Problem: Writer API fails in n8n workflows

### Symptoms
- Writer node returns 500 error
- "Requires a user gesture" error message
- Writer API works in webapp but not in n8n

### Root Cause
The Chrome Writer API requires user interaction and cannot be used in automated workflows like n8n.

### Solutions

**1. Use Chrome Prompt AI instead (Recommended):**
```
Chrome Prompt AI → Your workflow
```
The Prompt AI node provides similar text generation capabilities but works reliably in automated workflows.

**2. Use webapp for Writer functionality:**
- Open http://localhost:3333
- Use the Writer API through the web interface
- The webapp supports user interaction required by the Writer API

**3. Replace Writer with Prompt AI in workflows:**
```javascript
// Instead of Writer node, use Prompt AI with system prompt
System Prompt: "You are a professional writer. Write in a formal tone."
User Prompt: "Write an email about {{topic}}"
```

**4. Alternative workflow pattern:**
```
Input Data → Prompt AI (with writing instructions) → Output
```

---

**Still stuck?** Check `docs/SETUP.md` for complete setup or create GitHub issue!

