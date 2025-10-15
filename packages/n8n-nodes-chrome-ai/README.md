# n8n-nodes-chrome-ai

Professional n8n nodes for Chrome's built-in AI APIs. Run **local, private, on-device AI** in your automation workflows.

## ✨ Features

- 🤖 **7 AI Nodes** - Prompt, Writer, Summarizer, Translator, Rewriter, Proofreader, Language Detector
- 🔒 **100% Local** - All AI runs on-device (Gemini Nano)
- 🚀 **Zero Latency** - No API calls, instant responses
- 💰 **Free Forever** - No API keys, no rate limits
- 🛡️ **Privacy First** - Data never leaves your machine

## 📦 Installation

### Prerequisites

1. **n8n** installed and running
2. **Chrome 127+** (or Chrome Canary)
3. **Chrome AI Bridge** extension and server (see setup below)

### Install Package

```bash
# In your n8n installation
npm install n8n-nodes-chrome-ai

# Restart n8n
```

Nodes will appear in n8n under the "Chrome AI" category!

## 🚀 Quick Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/n8n-nodes-chrome-ai
cd n8n-nodes-chrome-ai
```

### 2. Build & Link (for development)

```bash
cd packages/n8n-nodes-chrome-ai
npm install
npm run build
npm link

# In n8n directory
cd ~/.n8n/custom
npm link n8n-nodes-chrome-ai
```

### 3. Start Bridge Server

```bash
cd packages/chrome-extension/server
npm install
npm start
```

### 4. Load Chrome Extension

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `packages/chrome-extension/`

### 5. Enable Chrome AI

1. Go to `chrome://flags`
2. Enable "Prompt API for Gemini Nano"
3. Enable "Enables optimization guide on device"
4. Restart Chrome
5. Wait for model download

### 6. Configure in n8n

1. Create credentials: "Chrome AI API"
2. Bridge URL: `http://localhost:3333`
3. Save and test connection

## 📚 Available Nodes

### Chrome Prompt AI
Full-featured LLM with system prompts and temperature control.

**Use cases:**
- Content generation
- Text analysis
- Question answering
- Creative writing

**Parameters:**
- System Prompt (optional)
- User Prompt (required)
- Temperature (0-2)

### Chrome Writer
Generate text with specific tone and length.

**Use cases:**
- Email drafting
- Social media posts
- Marketing copy

**Parameters:**
- Prompt (required)
- Tone: formal, neutral, casual
- Format: plain-text, markdown
- Length: short, medium, long

### Chrome Summarizer
Condense long text into concise summaries.

**Use cases:**
- Article summaries
- Meeting notes
- Research papers

**Parameters:**
- Text (required)
- Type: tl;dr, key-points, teaser, headline
- Format: plain-text, markdown
- Length: short, medium, long

### Chrome Translator
Translate between languages on-device.

**Use cases:**
- Multilingual content
- International communication
- Content localization

**Parameters:**
- Text (required)
- Source Language (auto-detect if empty)
- Target Language (required)

### Chrome Rewriter
Rephrase text with different tone or length.

**Use cases:**
- Tone adjustment
- Content variation
- Professional polish

**Parameters:**
- Text (required)
- Tone: more-formal, formal, neutral, casual, more-casual
- Length: shorter, same, longer

### Chrome Proofreader
Fix grammar, spelling, and clarity issues.

**Use cases:**
- Error correction
- Professional writing
- Quality assurance

**Parameters:**
- Text (required)

### Chrome Language Detector
Detect the language of text.

**Use cases:**
- Content routing
- Translation prep
- Multilingual processing

**Parameters:**
- Text (required)

## 🔧 How It Works

```
n8n Workflow
    ↓ HTTP POST to localhost:3333
Bridge Server
    ↓ WebSocket to Chrome Extension
Chrome Extension
    ↓ window.ai.* API calls
Chrome Built-in AI (Gemini Nano)
    ↓ Response flows back
```

## 📖 Example Workflows

### Simple AI Generation
```json
{
  "nodes": [
    {
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger"
    },
    {
      "name": "Chrome Prompt AI",
      "type": "n8n-nodes-chrome-ai.chromePromptAi",
      "credentials": {
        "chromeAiApi": "Chrome AI"
      },
      "parameters": {
        "userPrompt": "Write a haiku about automation"
      }
    }
  ]
}
```

### Content Pipeline
```
RSS Feed
  → Chrome Summarizer (condense)
  → Chrome Rewriter (casual tone)
  → Chrome Proofreader (polish)
  → Twitter (post)
```

### Multilingual Support
```
Webhook (receive text)
  → Chrome Language Detector
  → IF (language !== 'en')
      → Chrome Translator (to English)
  → Chrome Prompt AI (process)
  → Store in Database
```

## 🐛 Troubleshooting

### Nodes Don't Appear in n8n
```bash
# Restart n8n
pkill n8n
n8n start

# Check installation
npm list n8n-nodes-chrome-ai
```

### "Bridge not responding"
1. Start bridge server: `npm start` in server/
2. Check Chrome extension is loaded
3. Verify bridge URL: http://localhost:3333

### "AI not available"
1. Enable flags: `chrome://flags`
2. Download model: `chrome://components/`
3. Test in console: `window.ai`

### Connection Issues
```bash
# Check ports
lsof -i :3333
lsof -i :3334

# Check extension console
# chrome://extensions/ → service worker → Console
```

## 🔒 Privacy & Security

- ✅ All AI processing on-device
- ✅ Bridge runs on localhost only
- ✅ No external API calls
- ✅ No data collection
- ✅ Open source & auditable

## 🚀 Publishing

### To NPM
```bash
npm run build
npm publish
```

### To n8n Community
1. Publish to NPM
2. List on n8n community nodes page
3. Users can install via n8n UI

## 📄 License

MIT - Free to use, modify, and distribute

## 🤝 Contributing

Contributions welcome! See architecture docs for details.

## 🔗 Links

- [Chrome AI Documentation](https://developer.chrome.com/docs/ai/built-in-apis)
- [n8n Node Development](https://docs.n8n.io/integrations/creating-nodes/)
- [GitHub Repository](https://github.com/yourusername/n8n-nodes-chrome-ai)

---

**Built with ❤️ for the automation community**

*Making local AI accessible through n8n workflows*

