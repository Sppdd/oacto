# Chrome AI Bridge Server

Local bridge server that connects n8n workflows to Chrome Extension for AI execution.

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start
```

You should see:
```
🚀 Chrome AI Bridge Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HTTP Server: http://localhost:3333
🔌 WebSocket:   ws://localhost:3334
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Waiting for Chrome extension to connect...
```

## How It Works

1. **n8n** sends HTTP requests to `http://localhost:3333`
2. **Bridge server** forwards via WebSocket to Chrome extension
3. **Chrome extension** executes AI in browser context
4. **Response** flows back: Extension → Bridge → n8n

## API Endpoints

All endpoints expect JSON and return JSON:

### Health Check
```
GET /api/health

Response:
{
  "status": "ok",  // or "no-extension"
  "message": "Chrome AI bridge ready",
  "timestamp": "2024-10-14T..."
}
```

### Prompt AI
```
POST /api/prompt-ai

Body:
{
  "systemPrompt": "You are a...",  // optional
  "userPrompt": "Write a haiku",
  "temperature": 0.8               // optional, default 0.8
}

Response:
{
  "success": true,
  "result": "Generated text here..."
}
```

### Writer
```
POST /api/writer

Body:
{
  "prompt": "Write about...",
  "tone": "formal",        // optional: formal, neutral, casual
  "format": "plain-text",  // optional: plain-text, markdown
  "length": "medium"       // optional: short, medium, long
}
```

### Summarizer
```
POST /api/summarizer

Body:
{
  "text": "Long text to summarize...",
  "type": "tl;dr",         // optional: tl;dr, key-points, teaser, headline
  "format": "plain-text",
  "length": "medium"
}
```

### Translator
```
POST /api/translator

Body:
{
  "text": "Hello world",
  "sourceLanguage": "en",  // optional, auto-detect if omitted
  "targetLanguage": "es"   // required
}
```

### Rewriter
```
POST /api/rewriter

Body:
{
  "text": "Text to rewrite...",
  "tone": "more-formal",   // optional
  "format": "plain-text",
  "length": "same"         // optional: shorter, same, longer
}
```

### Proofreader
```
POST /api/proofreader

Body:
{
  "text": "Text to proofread..."
}
```

### Language Detector
```
POST /api/language-detector

Body:
{
  "text": "Text to analyze..."
}

Response:
{
  "success": true,
  "result": "en"  // language code
}
```

## Error Handling

Errors return:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common errors:
- `"Chrome extension not connected"` - Load extension in Chrome
- `"Request timeout"` - AI processing took too long
- `"AI not available"` - Enable Chrome flags

## Development

```bash
# Auto-restart on changes
npm run dev
```

## Ports

- **HTTP API**: 3333 (n8n connects here)
- **WebSocket**: 3334 (Chrome extension connects here)

Change in `server.js` if needed.

## Security

- Runs on localhost only (no external access)
- Optional API key authentication
- CORS enabled for n8n

## Logs

Server logs all requests:
- `✅ Chrome Extension connected`
- `📨 Received request: promptAI`
- `❌ Chrome Extension disconnected`

Check terminal for debugging!

