# 🚀 Quick Start - Chrome AI × n8n

Get up and running in 10 minutes!

## Step 1: Enable Chrome AI (5 mins)

```
1. Open Chrome (127+)
2. Go to: chrome://flags
3. Search: "Prompt API for Gemini Nano"
4. Enable + Restart
5. Wait for model download (~2GB)
```

**Verify**: Open console (F12), type `window.ai` → should see object

## Step 2: Start Bridge Server (1 min)

```bash
cd packages/chrome-extension/server
npm install
npm start
```

Should see: `📡 HTTP Server: http://localhost:3333`

**Keep this running!**

## Step 3: Load Extension (1 min)

```
1. chrome://extensions/
2. Developer mode ON
3. Load unpacked
4. Select: packages/chrome-extension/
```

Click extension icon → Should show "✅ Connected"

## Step 4: Setup n8n (2 mins)

```bash
# If n8n not installed:
npm install -g n8n

# Start n8n
n8n start
```

Access: `http://localhost:5678`

## Step 5: Install Nodes (1 min)

**Option A: Use installation script (easiest)**
```bash
./install.sh
```

**Option B: Manual installation**
```bash
# Build the n8n package
cd packages/n8n-nodes-chrome-ai
npm install
npm run build

# Link the package globally
npm link

# Create n8n custom directory (required!)
mkdir -p ~/.n8n/custom

# Link in n8n custom directory
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai

# Restart n8n
pkill n8n
n8n start
```

**If npm link fails:**
```bash
# Check if package was built
cd packages/n8n-nodes-chrome-ai
ls dist/  # Should show .js files

# If dist/ is empty, rebuild
npm run build

# Try linking again
npm link
```

## Step 6: Configure Credentials (1 min)

```
1. n8n → Settings → Credentials
2. Add "Chrome AI API"
3. Bridge URL: http://localhost:3333
4. Save + Test
```

Should show: ✅ Connection successful

## Step 7: Test Workflow (1 min)

```
1. New workflow
2. Add: Manual Trigger
3. Add: Chrome Prompt AI
4. Configure:
   - Credentials: Chrome AI Bridge
   - Prompt: "Write a haiku"
5. Execute!
```

You should see an AI-generated haiku! 🎉

## Troubleshooting

**"Bridge not responding"**
- Start bridge server: `npm start` in server/

**"AI not available"**
- Check: `chrome://components/`
- Model should be downloaded

**Nodes don't appear**
- Restart n8n: `pkill n8n && n8n start`

## What's Next?

- Import example workflows from `examples/`
- Read node documentation: `docs/NODE-REFERENCE.md`
- Build your first automation!

---

**Complete setup guide**: `docs/SETUP.md`

