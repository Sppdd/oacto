# Chrome AI Automation Platform

**Enterprise-grade automation platform** that brings Chrome's built-in AI (Gemini Nano) to n8n workflows with a beautiful, animated interface.

## 🎯 What This Is

A complete automation platform with:
- **7 n8n nodes** for Chrome AI APIs (Prompt, Writer, Summarizer, Translator, Rewriter, Proofreader, Language Detector)
- **Animated dashboard** with real-time status monitoring
- **Workflow management** - Run, organize, and schedule workflows with one click
- **AI session management** - Persistent conversations with automatic cleanup
- **Embedded n8n canvas** - Edit workflows without leaving the platform
- **Interactive guide** - Step-by-step setup with animations
- **100% local** - Zero external API calls, complete privacy

## 🏗️ Architecture (Simplified!)

```
n8n Workflow (localhost:5678)
    ↓ HTTP REST API
Web App Server (localhost:3333)
    ↓ WebSocket
Web App Page (open in Chrome)
    ↓ window.ai.*
Chrome Built-in AI (Gemini Nano)
```

**No browser extension needed!** Just keep a tab open.

## 📦 Project Structure

```
Journal.dev/
├── webapp/                  # Simple web app (NO extension!)
│   ├── server.js           # HTTP + WebSocket server
│   └── public/             # Web app UI
│       ├── index.html      # Beautiful dashboard
│       ├── app.js          # Chrome AI executor
│       ├── styles.css      # Modern UI
│       └── icon*.png       # Icons
│
├── packages/n8n-nodes-chrome-ai/  # NPM package for n8n
│   ├── nodes/              # 7 AI nodes
│   ├── credentials/        # Bridge authentication
│   └── utils/              # Client library
│
├── examples/               # Ready-to-import workflows
└── docs/                   # Documentation
```

## 🚀 Quick Start (3 Steps!)

### 0. Enable Chrome AI (5 mins)

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

**Verify**: Open console (F12), type `LanguageModel` → should see constructor function

### 1. Start Web App

```bash
cd webapp
npm install
npm start
```

### 2. Open in Chrome

```
http://localhost:3333
```

Keep this tab open (minimize is fine, just don't close it)

### 3. Install n8n Nodes

```bash
cd packages/n8n-nodes-chrome-ai
npm install && npm run build && npm link

mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai

# Start n8n
n8n start
```

### 4. Configure in n8n

```
1. n8n → Credentials → Chrome AI API
2. Bridge URL: http://localhost:3333
3. Test connection → ✅ Success!
```

That's it! Create workflows with Chrome AI nodes.

## 📝 Example Workflows

### Simple AI Generation
```
Manual Trigger → Chrome Prompt AI → Email
```

### Content Pipeline
```
RSS Feed → Summarizer → Rewriter → Proofreader → Twitter
```

### Multilingual Support
```
Webhook → Language Detector → IF → Translator → Process
```

## 📚 Available Nodes

1. **Chrome Prompt AI** - Full LLM with system prompts
2. **Chrome Writer** - Generate text with tone/length control
3. **Chrome Summarizer** - Condense long text
4. **Chrome Translator** - Translate languages on-device
5. **Chrome Rewriter** - Rephrase with tone adjustments
6. **Chrome Proofreader** - Fix grammar and spelling
7. **Chrome Language Detector** - Identify text language

## 🔒 Privacy & Security

✅ **100% Local Processing**
- AI runs on-device (Gemini Nano)
- Web app runs on localhost
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

### "Web app not connected"
1. Start server: `cd webapp && npm start`
2. Open http://localhost:3333 in Chrome
3. Keep tab open

### "AI not available"
1. Join Chrome AI Early Preview Program: https://goo.gle/chrome-ai-dev-preview-join
2. Enable flags in chrome://flags
3. Download model from chrome://components/
4. Refresh web app page

### Nodes don't appear in n8n
```bash
cd packages/n8n-nodes-chrome-ai
npm run build
npm link
cd ~/.n8n/custom && npm link n8n-nodes-chrome-ai
pkill n8n && n8n start
```

## 📖 Documentation

- **Quick Start**: `WEBAPP-QUICKSTART.md` (5 mins!)
- **Web App Details**: `webapp/README.md`
- **Node Reference**: `docs/NODE-REFERENCE.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Architecture**: `docs/ARCHITECTURE.md`

## ✨ Why Web App > Extension?

| Aspect | Extension | Web App |
|--------|-----------|---------|
| Setup | Load unpacked, manifest, etc. | Open URL |
| Debug | Service worker console | Regular DevTools |
| Installation | 5+ steps | 1 step |
| Updates | Reload extension | Refresh page |
| Complexity | High | Low |

**Result:** Same functionality, 90% simpler! 🎉

## 🎯 Roadmap

- [x] Web app architecture
- [x] All 7 AI APIs integrated
- [x] Status dashboard
- [x] Activity logging
- [ ] Publish to NPM
- [ ] Docker setup
- [ ] More AI nodes (as Chrome adds APIs)

## 🤝 Contributing

Contributions welcome! This is a professional-grade project ready for community adoption.

## 📄 License

MIT

---

**Built with ❤️ to make local AI automation accessible to everyone**

*No extension. No complexity. Just powerful automation.* 🚀
