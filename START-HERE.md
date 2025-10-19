# 🎉 Welcome to Chrome AI × n8n Web App!

## What You Just Built

A **super-simple system** that brings Chrome's built-in AI (Gemini Nano) to n8n workflows:

✅ **Web app** - No extension needed!  
✅ **7 n8n nodes** - All Chrome AI APIs  
✅ **Beautiful UI** - Status dashboard + activity log  
✅ **100% local** - Private, fast, free  

## 🚀 Get Started in 3 Steps

### 1. Enable Chrome AI (5 mins)

```
1. Join Chrome AI Early Preview Program: https://goo.gle/chrome-ai-dev-preview-join
2. Enable flags in chrome://flags:
   - "Prompt API for Gemini Nano" → Enable
   - "Enables optimization guide on device" → Enable
3. Restart Chrome
4. Download model in chrome://components/:
   - Find "Optimization Guide On Device Model"
   - Click "Check for update"
   - Wait 5-10 minutes for ~1.5GB download
5. Restart Chrome when download completes
```

### 2. Start Web App (1 min)

```bash
cd webapp
npm install
npm start
```

### 3. Open in Chrome (30 seconds)

```
Navigate to: http://localhost:3333
Keep this tab open!
```

You should see:
- ✅ Server Connection: Connected
- ✅ Chrome AI: Ready

## Test It!

In the web app dashboard:
1. Enter: "Write a haiku about automation"
2. Click "Test Prompt AI"
3. See AI-generated haiku! 🎉

## Setup n8n

```bash
# Install nodes
cd packages/n8n-nodes-chrome-ai
npm install && npm run build && npm link

# Link in n8n
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai

# Start n8n
n8n start
```

In n8n (http://localhost:5678):
1. Credentials → Chrome AI API
2. Bridge URL: http://localhost:3333
3. Create workflow → Add Chrome Prompt AI node
4. Execute! ✨

## 📁 Project Structure

```
webapp/                        # ⭐ Web app (new & simple!)
├── server.js                  # HTTP + WebSocket server
├── package.json              # Dependencies
└── public/                   # Web interface
    ├── index.html            # Status dashboard
    ├── app.js                # Chrome AI executor
    ├── styles.css            # Beautiful UI
    └── icon*.png             # Icons

packages/n8n-nodes-chrome-ai/  # n8n nodes (unchanged)
├── nodes/                     # 7 AI nodes
├── credentials/              # Credentials
└── utils/                    # Client library

examples/                      # Example workflows
docs/                         # Documentation
```

## 📚 Documentation

- **Web App Guide**: `webapp/README.md`
- **Node Reference**: `docs/NODE-REFERENCE.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Architecture**: `docs/ARCHITECTURE.md`

## 🎯 What's Different?

### Old Approach (Extension):
- ❌ Complex manifest V3 setup
- ❌ Service worker + content script coordination
- ❌ Extension installation steps
- ❌ Harder to debug

### New Approach (Web App):
- ✅ Just open a webpage
- ✅ Direct window.ai access
- ✅ Regular browser DevTools
- ✅ Super simple!

**Same power, 90% simpler!** 🚀

## Daily Usage

```bash
# Terminal 1: Web app
cd webapp && npm start

# Terminal 2: n8n
n8n start

# Chrome: Open http://localhost:3333
# Keep tab open (minimize is fine)
# Build workflows in n8n!
```

## 💡 Key Feature: Activity Log

The web app shows real-time activity:
- 📨 When n8n sends requests
- ✅ When AI responds successfully
- ❌ When errors occur

Perfect for debugging!

## 🔒 Privacy & Security

✅ **100% Local** - All AI runs on your machine  
✅ **No External Calls** - Everything on localhost  
✅ **No API Keys** - Chrome AI is free  
✅ **Open Source** - Audit all code  

## ⚡ Quick Commands

```bash
# Start web app
cd webapp && npm start

# Open in Chrome
open http://localhost:3333

# Test server
curl http://localhost:3333/api/health

# Start n8n
n8n start
```

## 🎉 Success Indicators

You're all set if:
- ✅ Web app shows "Connected" and "AI Ready"
- ✅ Test button generates AI text
- ✅ Activity log shows requests
- ✅ n8n credentials test succeeds
- ✅ Workflows execute successfully

## 🚀 Next Steps

1. **Import examples** from `examples/` folder
2. **Create workflows** using Chrome AI nodes
3. **Watch activity log** to see it working
4. **Build amazing automations**!

---

**Ready to use NOW!** Just `cd webapp && npm start` then open http://localhost:3333 🎉

**Questions?** See `webapp/README.md` for detailed setup!

**Want to learn?** Check `docs/` for comprehensive guides!
