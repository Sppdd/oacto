# Chrome AI Bridge Server

Simple web application that connects n8n workflows with Chrome's built-in AI (Gemini Nano).

## Purpose

This web app acts as a **bridge** between n8n and Chrome's AI APIs. It must be open in a Chrome tab for n8n workflows to use Chrome AI.

## Why a Web App?

- `window.ai` is only available in web page contexts
- Simpler than Chrome extensions
- Easy debugging with DevTools
- Direct access to Chrome's built-in AI

## Quick Start

### 1. Start the Server

```bash
cd webapp
npm install
npm start
```

Server runs on `http://localhost:3333`

### 2. Open in Chrome

1. Navigate to `http://localhost:3333`
2. Keep this tab open (can minimize)
3. Verify status indicators show "Connected" and "Ready"

### 3. Configure n8n

1. Open n8n at `http://localhost:5678`
2. Add "Chrome AI API" credentials
3. Set Bridge URL: `http://localhost:3333`
4. Create workflows with Chrome AI nodes

## Features

- **Status Monitoring**: Real-time connection and AI status
- **Activity Log**: View all requests from n8n
- **Test Interface**: Test AI directly from the UI
- **Simple Design**: Clean, functional interface
- **Auto-reconnect**: Automatically reconnects if disconnected

## Requirements

- Chrome with AI flags enabled
- Gemini Nano model downloaded
- Node.js for the server
- Active n8n instance

## Files

```
webapp/
├── server.js              # HTTP + WebSocket server
├── package.json           # Dependencies
└── public/
    ├── index.html         # Simple UI
    ├── app.js             # Core logic
    ├── styles.css         # Clean styles
    ├── tokens.js          # Origin trial tokens
    └── icon*.svg          # App icons
```

## Troubleshooting

### "AI not available"
- Enable flags: `chrome://flags`
- Download model: `chrome://components/`
- Refresh the page

### "Server disconnected"
- Check server is running: `npm start`
- Verify port 3333 is not in use
- Check browser console (F12) for errors

### n8n can't connect
- Ensure webapp is open at `http://localhost:3333`
- Check "Server Connection" shows "Connected"
- Test: `curl http://localhost:3333/api/health`

## Architecture

```
┌─────────────┐
│ n8n Workflow│
└──────┬──────┘
       │ HTTP
       ↓
┌─────────────┐
│   Server    │──→ WebSocket
│ (port 3333) │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Web App    │──→ window.ai
│ (Chrome Tab)│
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Gemini Nano │
│  (On-Device)│
└─────────────┘
```

## Notes

- **Keep tab open**: Web app must stay open for workflows to work
- **Local only**: All processing happens on your device
- **Private**: No data sent to external servers
- **Single tab**: Only one instance needed

---

**Part of the Chrome AI × n8n integration project**
