# n8n-nodes-chrome-ai

Professional n8n nodes for Chrome's built-in AI APIs. Run **local, private, on-device AI** in your automation workflows.

## ✨ Features

- 🤖 **7 AI Nodes** - Prompt, Writer, Summarizer, Translator, Rewriter, Proofreader, Language Detector
- 🔒 **100% Local** - All AI runs on-device (Gemini Nano)
- 🚀 **Zero Latency** - No API calls, instant responses
- 💰 **Free Forever** - No API keys, no rate limits
- 🛡️ **Privacy First** - Data never leaves your machine
- 🌐 **Web App** - with the extension or just open a webpage!

## ⚠️ Important Notes

**Writer API Limitation**: The Chrome Writer API requires user interaction and cannot be used in automated n8n workflows. If you need text generation functionality in n8n, please use the **Chrome Prompt AI** node instead, which provides similar capabilities but works reliably in automated workflows.

## 📦 Installation

### Prerequisites

1. **n8n** installed and running
2. **Chrome 127+** (or Chrome Canary)
3. **Chrome AI Web App** (see setup below)

## 🚀 Quick Setup

### 1. Build & Link n8n Nodes

```bash
cd packages/n8n-nodes-chrome-ai
npm install
npm run build
npm link

# Link in n8n
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai

# Restart n8n
pkill n8n
n8n start
```

### 2. Start Web App

```bash
cd webapp
npm install
npm start
```

### 3. Open Web App in Chrome

```
Navigate to: http://localhost:3333
Keep this tab open!
```

### 4. Enable Chrome AI

```
1. chrome://flags → "Prompt API for Gemini Nano" → Enable
2. chrome://components/ → Download "Optimization Guide" model
3. Restart Chrome
4. Refresh web app page
```

### 5. Configure in n8n

```
1. n8n → Settings → Credentials → Add "Chrome AI API"
2. Bridge URL: http://localhost:3333
3. Save and test → Should show ✅ Connected
```

## 🎯 Usage

1. **Start web app**: `cd webapp && npm start`
2. **Open in Chrome**: http://localhost:3333
3. **Keep tab open** (minimize is fine)
4. **Create n8n workflows** with Chrome AI nodes
5. **Execute** and watch the activity log in web app!

## 📚 Available Nodes

### 1. Chrome Prompt AI
Full-featured LLM (Gemini Nano) with system prompts and temperature control.

### 2. Chrome Writer
Generate text with specific tone/length for emails, posts, and copy.

### 3. Chrome Summarizer
Condense long text into TL;DR, key points, teasers, or headlines.

### 4. Chrome Translator
Translate between languages on-device with auto-detection.

### 5. Chrome Rewriter
Rephrase text with different tone or length adjustments.

### 6. Chrome Proofreader
Fix grammar, spelling, and improve text clarity.

### 7. Chrome Language Detector
Identify the language of any text.

## 🔧 How It Works

```
n8n Workflow
    ↓ HTTP POST to localhost:3333
Web App Server
    ↓ WebSocket to Web Page
Web App (open in Chrome tab)
    ↓ window.ai.* API calls
Chrome Built-in AI (Gemini Nano)
```

## 🐛 Troubleshooting

### Nodes Don't Appear in n8n
```bash
# Rebuild and relink
cd packages/n8n-nodes-chrome-ai
npm run build && npm link
cd ~/.n8n/custom && npm link n8n-nodes-chrome-ai
pkill n8n && n8n start
```

### "Web app not connected"
1. Start web app: `cd webapp && npm start`
2. Open in Chrome: http://localhost:3333
3. Keep tab open

### "AI not available"
1. Enable flags: chrome://flags
2. Download model: chrome://components/
3. Refresh web app page

## 📖 Example Workflows

See `examples/` folder for ready-to-import workflows:
- Simple AI generation
- Content processing pipeline
- Multilingual workflows

## 🔒 Privacy & Security

- ✅ All AI processing on-device
- ✅ Web app runs on localhost only
- ✅ No external API calls
- ✅ No data collection
- ✅ Open source & auditable

## 📄 License

MIT - Free to use, modify, and distribute

## 🔗 Links

- [Chrome AI Documentation](https://developer.chrome.com/docs/ai/built-in-apis)
- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [Web App Quick Start](../WEBAPP-QUICKSTART.md)

---

**Built with ❤️ for the automation community**

*Making local AI accessible through n8n workflows - Now even simpler with web app!*
