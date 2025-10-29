
<p align="center">
  <img src="chrome-workflows/icons/icon_128.png" alt="Chrome Workflows Extension Icon" width="96" />
  <br />
  <sub><b>Chrome Workflows Extension</b> <code>v0.5.0</code></sub>
</p>


# Chrome AI × n8n Integration

Local, private AI automation with Chrome's built-in Gemini Nano and n8n workflows.

## What is this?

This project connects **n8n** (workflow automation) with **Chrome's built-in AI** (Gemini Nano), allowing you to create AI-powered workflows that run entirely on your device.

## Components

### 1. **Chrome AI Bridge Server** (`webapp/`)
A Node.js server with a web interface that bridges n8n and Chrome's AI APIs.

- Runs on `localhost:3333`
- Must be open in a Chrome tab
- Processes AI requests from n8n
- 100% local, private AI

### 2. **n8n Chrome AI Nodes** (`packages/n8n-nodes-chrome-ai/`)
Custom n8n nodes that expose Chrome's AI capabilities:

- **Chrome Prompt AI** ✅ - General text generation (works reliably)
- Chrome Writer - Text writing with tone/format
- Chrome Summarizer - Text summarization
- Chrome Translator - Language translation
- Chrome Rewriter - Text rewriting
- Chrome Proofreader - Grammar checking
- Chrome Language Detector - Language detection

> **Note**: Currently only Prompt AI works reliably. Other APIs are experimental and require user interaction.

### 3. **Chrome Workflows Extension** (`chrome-workflows/`)
Browser extension to trigger n8n workflows from any webpage via right-click.

- Trigger workflows with context menu
- Pass page data to workflows
- Manage workflows from extension

## Quick Start

### Prerequisites

1. **Chrome with AI enabled**:
   - Join [Chrome AI Early Preview](https://goo.gle/chrome-ai-dev-preview-join)
   - Enable flags: `chrome://flags/#prompt-api-for-gemini-nano`
   - Download model: `chrome://components/` → "Optimization Guide On Device Model"

2. **n8n installed**:
   ```bash
   npm install -g n8n
   ```

### Setup

1. **Install Chrome AI Nodes**:
   ```bash
   cd packages/n8n-nodes-chrome-ai
   npm install && npm run build && npm link
   cd ~/.n8n/custom
   npm link n8n-nodes-chrome-ai
   ```

2. **Start the Bridge Server**:
   ```bash
   cd webapp
   npm install
   npm start
   ```
   Open `http://localhost:3333` in Chrome and keep it open.

3. **Start n8n**:
   ```bash
   n8n start
   ```
   Open `http://localhost:5678`

4. **Configure n8n**:
   - Go to Settings → Credentials
   - Add "Chrome AI API" credential
   - Set Bridge URL: `http://localhost:3333`

5. **Create your first workflow**:
   - Add "Chrome Prompt AI" node
   - Configure prompt and parameters
   - Run the workflow!

## Scripts to faster setup. 

### Start Everything
```bash
./start-platform.sh
```
Starts bridge server and n8n.

### Stop Everything
```bash
./stop-platform.sh
```
Stops all services.






## How It Works

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  1. User creates workflow in n8n                         │
│     with Chrome AI nodes                                 │
│                                                          │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTP Request
                     ↓
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  2. n8n node sends request to                            │
│     Bridge Server (localhost:3333)                       │
│                                                          │
└────────────────────┬─────────────────────────────────────┘
                     │ WebSocket
                     ↓
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  3. Bridge Server forwards to                            │
│     Web App (Chrome tab)                                 │
│                                                          │
└────────────────────┬─────────────────────────────────────┘
                     │ window.ai
                     ↓
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  4. Web App calls Chrome AI APIs                         │
│     (Gemini Nano on-device)                              │
│                                                          │
└────────────────────┬─────────────────────────────────────┘
                     │ Response
                     ↓
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  5. Result returns through chain                         │
│     back to n8n workflow                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Project Structure

```
Journal.dev/
├── webapp/                    # Bridge Server & Web App
│   ├── server.js             # HTTP + WebSocket server
│   ├── public/               # Web interface
│   │   ├── index.html        # Simple UI
│   │   ├── app.js            # Core logic
│   │   ├── styles.css        # Clean styles
│   │   └── tokens.js         # Origin trial tokens
│   └── package.json
│
├── packages/
│   └── n8n-nodes-chrome-ai/  # Custom n8n nodes
│       ├── nodes/            # Node implementations
│       ├── credentials/      # Chrome AI credentials
│       └── utils/            # HTTP client
│
├── chrome-workflows/          # Browser extension
│   ├── manifest.json         # Extension config
│   ├── background.js         # Service worker
│   ├── popup/                # Extension popup
│   └── manage_workflows/     # Workflow management
│
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md       # System architecture
│   ├── NODE-REFERENCE.md     # Node documentation
│   └── TROUBLESHOOTING.md    # Common issues
│
├── start-platform.sh         # Start everything
└── stop-platform.sh          # Stop everything
```

## Features

- ✅ **100% Local** - All AI processing on your device
- ✅ **Private** - No data sent to external servers
- ✅ **Free** - No API costs, uses Chrome's built-in AI
- ✅ **Fast** - On-device inference, no network latency
- ✅ **Integrated** - Works seamlessly with n8n workflows
- ✅ **Session Management** - Continue conversations across workflow runs
- ✅ **Fallback Support** - Automatically falls back to Prompt AI when specific APIs unavailable
- ✅ **Concurrent Sessions** - Multiple AI operations can run simultaneously

## Limitations

- Web app must be open in Chrome tab
- Chrome AI flags must be enabled
- Gemini Nano model must be downloaded (~1.5GB)
- **All Chrome AI nodes now work reliably** with automatic fallback to Prompt AI
- Writer API may still require user interaction but has fallback support

## Scripts

### Start Everything
```bash
./start-platform.sh
```
Starts bridge server and n8n.

### Stop Everything
```bash
./stop-platform.sh
```
Stops all services.

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture
- **[docs/NODE-REFERENCE.md](docs/NODE-REFERENCE.md)** - n8n nodes reference
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and fixes
- **[webapp/README.md](webapp/README.md)** - Bridge server details
- **[chrome-workflows/readme.md](chrome-workflows/readme.md)** - Extension details

## Use Cases

- **Content Generation**: Create articles, emails, social posts
- **Data Processing**: Summarize documents, extract information
- **Translation**: Translate text between languages
- **Code Assistance**: Generate code snippets, explain code
- **Research**: Analyze text, answer questions
- **Automation**: Any workflow that needs AI text processing

## Requirements

- **Chrome**: Version 127+ with AI features
- **n8n**: Any recent version
- **Node.js**: Version 16+
- **Operating System**: macOS, Linux, or Windows

## Privacy & Security

- All AI processing happens **locally** on your device
- No data is sent to external servers
- Gemini Nano runs **on-device**
- Communication is only on `localhost`
- Your data never leaves your machine

## Contributing

This is an experimental integration. Contributions, bug reports, and suggestions are welcome!

## Known Issues

1. **Model download is large** - Gemini Nano is ~1.5GB
2. **Chrome flags required** - Must enable experimental features
3. **Single tab requirement** - Web app must stay open
4. **Writer API user gestures** - May require user interaction but has fallback support

## Troubleshooting

**AI not available?**
- Enable Chrome flags: `chrome://flags`
- Download model: `chrome://components/`
- Restart Chrome

**Can't connect?**
- Ensure web app is open: `http://localhost:3333`
- Check server is running: `cd webapp && npm start`
- Verify n8n credentials have correct URL

**Workflows fail?**
- Check web app activity log
- Verify Chrome AI status shows "Ready"
- Use Chrome Prompt AI node (most reliable)

## License

MIT

## Author

Built with ❤️ for local, private AI automation

---

**Keep the web app open in Chrome for workflows to work!**
