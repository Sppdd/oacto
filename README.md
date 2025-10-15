# Chrome Built-in AI × n8n Integration

Transform Chrome's built-in AI APIs into professional n8n nodes for **local-first, privacy-focused automation**.

## 🎯 What This Is

A complete system that brings Chrome's on-device AI (Gemini Nano) to n8n workflows:
- **7 n8n nodes** for Chrome AI APIs (Prompt, Writer, Summarizer, Translator, Rewriter, Proofreader, Language Detector)
- **Bridge server** connecting n8n to Chrome extension
- **Chrome extension** executing AI in browser context
- **100% local** - zero external API calls

## 🏗️ Architecture

```
n8n Workflow (localhost:5678)
    ↓ HTTP REST API
Bridge Server (localhost:3333)
    ↓ WebSocket
Chrome Extension
    ↓ Browser APIs
Chrome Built-in AI (Gemini Nano)
```

## 📦 Project Structure

```
packages/
├── n8n-nodes-chrome-ai/     # NPM package for n8n
│   ├── nodes/               # 7 AI nodes
│   ├── credentials/         # Bridge authentication
│   └── utils/               # Client library
│
└── chrome-extension/        # Chrome extension + bridge
    ├── server/              # Node.js bridge server
    ├── background/          # WebSocket client
    ├── content/             # AI execution
    └── popup/               # Status UI
```

## 🚀 Quick Start

### 1. Install n8n Nodes

```bash
cd packages/n8n-nodes-chrome-ai
npm install
npm run build

# Link locally for testing
npm link

# In your n8n installation
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai

# Restart n8n
```

### 2. Start Bridge Server

```bash
cd packages/chrome-extension/server
npm install
npm start
```

You should see:
```
🚀 Chrome AI Bridge Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HTTP Server: http://localhost:3333
🔌 WebSocket:   ws://localhost:3334
```

### 3. Load Chrome Extension

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: `packages/chrome-extension/`
5. Extension connects automatically ✅

### 4. Enable Chrome AI

1. Go to `chrome://flags`
2. Enable "Prompt API for Gemini Nano"
3. Enable "Enables optimization guide on device"
4. Restart Chrome
5. Wait for model download (~1.5GB)

### 5. Configure n8n

1. Open n8n: `http://localhost:5678`
2. Create new credentials: "Chrome AI API"
3. Bridge URL: `http://localhost:3333`
4. Save credentials

### 6. Create Your First Workflow

1. Add node: "Chrome Prompt AI"
2. Select credentials
3. Enter prompt: "Write a haiku about automation"
4. Execute! 🎉

## 📝 Example Workflows

### Simple AI Generation
```
Manual Trigger
  → Chrome Prompt AI ("Write a blog post about...")
  → Email (send result)
```

### Content Translation Pipeline
```
RSS Feed
  → Chrome Summarizer (condense article)
  → Chrome Translator (EN → ES)
  → Twitter (post translated summary)
```

### Smart Email Assistant
```
Gmail Trigger (new email)
  → Chrome Summarizer (TL;DR)
  → Chrome Prompt AI (draft reply)
  → Chrome Proofreader (polish)
  → Gmail (send draft)
```

## 🔧 Development

### n8n Nodes

```bash
cd packages/n8n-nodes-chrome-ai
npm run dev      # Watch mode
npm run build    # Production build
npm run lint     # Check code
```

### Bridge Server

```bash
cd packages/chrome-extension/server
npm run dev      # Nodemon auto-restart
```

### Chrome Extension

1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click refresh icon on extension
4. Changes applied instantly

## 📚 Available Nodes

### 1. Chrome Prompt AI
- Full-featured LLM (Gemini Nano)
- System prompts
- Temperature control
- Variable interpolation

### 2. Chrome Writer
- Generate text with specific tone/length
- Options: formal, neutral, casual
- Formats: plain-text, markdown

### 3. Chrome Summarizer
- Condense long text
- Types: tl;dr, key-points, teaser, headline
- Configurable length

### 4. Chrome Translator
- Translate between languages
- Auto-detect source language
- On-device translation

### 5. Chrome Rewriter
- Rephrase text
- Adjust tone and length
- Maintain meaning

### 6. Chrome Proofreader
- Fix grammar and spelling
- Improve clarity
- Professional polish

### 7. Chrome Language Detector
- Detect text language
- Returns language code
- Confidence scores

## 🔒 Privacy & Security

✅ **100% Local Processing**
- AI runs on-device (Gemini Nano)
- Bridge server runs on localhost
- No external API calls
- No data leaves your machine

✅ **No API Keys Required**
- Chrome AI is free
- No rate limits
- No subscriptions

✅ **Open Source**
- Inspect all code
- Self-hosted
- Full control

## 🐛 Troubleshooting

### Bridge Server Won't Start
```bash
# Check if port is in use
lsof -i :3333

# Kill process if needed
kill -9 <PID>
```

### Extension Won't Connect
1. Check bridge server is running
2. Check console: `chrome://extensions/` → "service worker"
3. Reload extension

### AI Not Available
1. Enable flags in `chrome://flags`
2. Check model download: `chrome://components/`
3. Wait for "Optimization Guide On Device Model" to finish
4. Test: Open console, type `window.ai`

### n8n Nodes Not Showing
```bash
# Check if package is built
cd packages/n8n-nodes-chrome-ai
ls dist/  # Should show .js files

# If dist/ is empty, rebuild
npm run build

# Check if package is linked
cd ~/.n8n/custom
npm list
# Should show n8n-nodes-chrome-ai

# If not linked, link it
npm link n8n-nodes-chrome-ai

# Restart n8n completely
pkill n8n
n8n start
```

## 📖 Documentation

See detailed plan: [`N8N-CHROME-AI-REFACTOR-PLAN.md`](./N8N-CHROME-AI-REFACTOR-PLAN.md)

## 🎯 Roadmap

- [ ] Publish to NPM
- [ ] Chrome Web Store
- [ ] More AI nodes (as Chrome adds APIs)
- [ ] Workflow templates
- [ ] Docker setup
- [ ] CI/CD pipeline

## 🤝 Contributing

Contributions welcome! This is a professional-grade project ready for community adoption.

## 📄 License

MIT

---

**Built with ❤️ to make local AI automation accessible to everyone**

*No API keys. No subscriptions. No data collection. Just powerful automation.*

