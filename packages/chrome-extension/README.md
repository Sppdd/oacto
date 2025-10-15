# Chrome AI Bridge Extension

Chrome extension that exposes Chrome's built-in AI APIs to n8n via a local bridge server.

## Quick Start

### 1. Enable Chrome AI

```
1. chrome://flags
2. Search: "Prompt API for Gemini Nano"
3. Enable + Restart Chrome
4. Wait for model download
```

### 2. Load Extension

```
1. chrome://extensions/
2. Developer mode ON
3. Load unpacked → select this folder
```

### 3. Start Bridge Server

```bash
cd server
npm install
npm start
```

### 4. Verify Connection

Click extension icon - should show:
- Bridge Server: ✅ Connected
- Chrome AI: ✅ Available

## Architecture

```
Extension Components:
- service-worker.js → WebSocket client to bridge
- content-script.js → Executes AI APIs in page context
- popup → Shows connection status
```

## Configuration

Extension automatically connects to:
- WebSocket: `ws://localhost:3334`

Change in `background/service-worker.js` if needed.

## Debugging

**Service Worker Console:**
```
chrome://extensions/ → "service worker" link
```

**Content Script Console:**
```
Open any page → F12 → Console
Look for: "Chrome AI Bridge content script loaded"
```

## Supported AI APIs

All 7 Chrome built-in AI APIs:
1. Prompt API (Gemini Nano)
2. Writer
3. Summarizer
4. Translator
5. Rewriter
6. Proofreader
7. Language Detector

## Security

- Runs on localhost only
- No external network access
- All AI processing on-device
- Optional API key authentication

## Development

```bash
# Make changes
# Go to chrome://extensions/
# Click refresh icon
# Test immediately
```

---

**Part of the n8n Chrome AI integration project**

