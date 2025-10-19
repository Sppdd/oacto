# Chrome AI Web App for n8n

Simple web app that connects Chrome's built-in AI APIs to n8n workflows.

## Why Web App Instead of Extension?

✅ **Much Simpler** - No extension complexity, just open a webpage  
✅ **Easy to Debug** - Regular browser DevTools  
✅ **Direct Access** - window.ai available immediately  
✅ **Faster Setup** - No manifest.json, no extension loading  
✅ **Same Privacy** - 100% local, no external calls  

## Quick Start

### 1. Enable Chrome AI

```
1. chrome://flags
2. Search: "Prompt API for Gemini Nano"
3. Enable + Restart Chrome
4. Wait for model download
```

### 2. Start Server

```bash
cd webapp
npm install
npm start
```

### 3. Open Web App

```
1. Open Chrome
2. Navigate to: http://localhost:3333
3. Keep this tab open (minimize is fine)
```

You should see:
- Server Connection: ✅ Connected
- Chrome AI: ✅ Ready

### 4. Use in n8n

```
1. n8n → Credentials → Chrome AI API
2. Bridge URL: http://localhost:3333
3. Save and test
4. Create workflows with Chrome AI nodes!
```

## Architecture

```
┌─────────────────┐
│  n8n Workflows  │
└────────┬────────┘
         │ HTTP REST
         ↓
┌─────────────────┐
│  Server (3333)  │──→ Serves HTML
└────────┬────────┘
         │ WebSocket
         ↓
┌─────────────────┐
│  Web App (HTML) │──→ In Chrome tab
└────────┬────────┘
         │ window.ai.*
         ↓
┌─────────────────┐
│ Chrome Built-in │
│   AI (Gemini)   │
└─────────────────┘
```

## Features

- ✅ All 7 Chrome AI APIs
- ✅ Real-time activity log
- ✅ Connection status monitoring
- ✅ Test AI directly in UI
- ✅ Auto-reconnect on disconnect
- ✅ Proper session management

## Usage

### Keep Tab Open
The web app **must stay open** for n8n workflows to work. You can minimize the tab, but don't close it.

### Test AI
Use the built-in test area to verify Chrome AI is working before running n8n workflows.

### Monitor Activity
The activity log shows all n8n requests in real-time.

## Troubleshooting

### "AI not available"
1. Enable flags in chrome://flags
2. Download model from chrome://components/
3. Refresh the page

### "Server disconnected"
1. Refresh the page
2. Check server is running
3. Check browser console (F12) for errors

### n8n Can't Connect
1. Verify web app is open at http://localhost:3333
2. Check "Server Connection" shows "Connected"
3. Test health: `curl http://localhost:3333/api/health`

## Development

```bash
# Auto-restart on changes
npm run dev

# Check server logs
# Terminal shows all activity

# Check client logs
# F12 → Console in web app tab
```

## Advantages Over Extension

| Feature | Extension | Web App |
|---------|-----------|---------|
| Setup | Complex | Simple |
| Debug | Service worker console | Regular DevTools |
| Installation | Load unpacked | Open URL |
| Updates | Reload extension | Refresh page |
| Complexity | High | Low |
| User Experience | Background | Visible tab |

## Files

```
webapp/
├── server.js           # HTTP + WebSocket server
├── package.json        # Dependencies
└── public/             # Web app frontend
    ├── index.html      # UI
    ├── app.js          # AI executor
    ├── styles.css      # Styling
    └── icon*.png       # Icons
```

---

**Part of the Chrome AI × n8n integration project**

**Much simpler than the extension approach!** 🎉

