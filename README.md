
<p align="center">
  <img src="./assets/icon128.png" alt="Chrome Workflows Extension Icon" width="96" />
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
- Chrome Summarizer - Text summarisation
- Chrome Translator - Language translation
- Chrome Rewriter - Text rewriting
- Chrome Proofreader - Grammar checking
- Chrome Language Detector - Language detection

> **Note**: Currently, only Prompt AI works reliably. Other APIs are experimental and require user interaction.

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

### Install Everything
```bash
./install.sh
```

### Start Everything
```bash
./start-platform.sh
```
Starts the bridge server and n8n.

### Stop Everything
```bash
./stop-platform.sh
```
Stops all services.

## N8n workflows powered by Chrome AI APIs

All what you need to do is to drag and drop or use the import file on the top right menu and select the Json file to a N8n canvas to run them. 

These workflows are the same once that been showcased in the demo.

I recommend starting with the [Chat with Chrome Prompt AI workflow](./Chat%20with%20Chrome%20Prompt%20AI.json), because doesn't need any crendentials to setup.


## Features

- ✅ **100% Local** - All AI processing on your device
- ✅ **Private** - No data sent to external servers
- ✅ **Free** - No API costs, uses Chrome's built-in AI
- ✅ **Fast** - On-device inference, no network latency
- ✅ **Integrated** - Works seamlessly with n8n workflows
- ✅ **Session Management** - Continue conversations across workflow runs
- ✅ **Fallback Support** - Automatically falls back to Prompt AI when specific APIs are unavailable
- ✅ **Concurrent Sessions** - Multiple AI operations can run simultaneously

## Limitations

- Web app must be open in a Chrome tab
- Chrome AI flags must be enabled
- Gemini Nano model must be downloaded (~1.5GB)
- **All Chrome AI nodes now work reliably** with automatic fallback to Prompt AI
- Writer API may still require user interaction, but has fallback support

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
- **Research**: Analyse text, answer questions
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


## Known Issues

1. **Model download is large** - Gemini Nano is ~1.5GB
2. **Chrome flags required** - Must enable experimental features
3. **Single tab requirement** - Web app must stay open
4. **Writer API user gestures** - May require user interaction but has fallback support

---

**Keep the web app open in Chrome for workflows to work!**
