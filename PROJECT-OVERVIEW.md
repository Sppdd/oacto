# Chrome AI × n8n Integration - Complete Project Overview

This document provides a comprehensive overview of how the entire Chrome AI automation platform works, from the Chrome extension to n8n workflows.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Machine                        │
│                                                          │
│  ┌──────────────┐    HTTP     ┌──────────────────┐     │
│  │              │  :3333      │                   │     │
│  │   n8n        ├────────────►│  Bridge Server   │     │
│  │  Workflow    │             │   (Node.js)       │     │
│  │   Engine     │◄────────────┤   Express + WS   │     │
│  │              │   Response   │                   │     │
│  └──────────────┘             └─────────┬─────────┘     │
│                                          │               │
│                                WebSocket │ :3334         │
│                                          ▼               │
│                                ┌──────────────────┐     │
│                                │  Chrome          │     │
│                                │  Web App         │     │
│                                │  (HTML/JS)       │     │
│                                └────────┬─────────┘     │
│                                         │               │
│                                    APIs │               │
│                                         ▼               │
│                                ┌──────────────────┐     │
│                                │  Chrome AI       │     │
│                                │  (Gemini Nano)   │     │
│                                │  On-Device Model │     │
│                                └──────────────────┘     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📦 Project Components

### 1. **n8n Nodes** (TypeScript)
**Location**: `packages/n8n-nodes-chrome-ai/`

**Purpose**: Expose Chrome AI as n8n workflow nodes

**Components**:
- **7 AI Nodes**: Prompt AI, Writer, Summarizer, Translator, Rewriter, Proofreader, Language Detector
- **ChromeAiClient**: HTTP client for bridge communication
- **Credentials**: Authentication for bridge API

**Data Flow**:
```
n8n execution → Node execute() method
              → ChromeAiClient.promptAi()
              → axios.post('http://localhost:3333/api/prompt-ai')
              → Return formatted data
```

### 2. **Bridge Server** (Node.js)
**Location**: `webapp/server.js`

**Purpose**: HTTP API server that communicates with Chrome extension

**Technology**:
- Express.js (HTTP server on port 3333)
- WebSocket server (port 3334)
- CORS enabled for n8n communication

**Endpoints**:
- `POST /api/prompt-ai` - Prompt API
- `POST /api/writer` - Writer API
- `POST /api/summarizer` - Summarizer API
- `POST /api/translator` - Translator API
- `POST /api/rewriter` - Rewriter API
- `POST /api/proofreader` - Proofreader API
- `POST /api/language-detector` - Language Detector API

**Request Flow**:
1. n8n sends POST to `/api/prompt-ai`
2. Server validates request
3. Generates unique request ID
4. Sends to webapp via WebSocket
5. Waits for response (30s timeout)
6. Returns response to n8n

### 3. **Chrome Web App** (HTML/JavaScript)
**Location**: `webapp/public/`

**Purpose**: Web interface that accesses Chrome AI APIs

**Components**:
- **index.html**: Main web interface
- **app.js**: JavaScript application logic
- **tokens.js**: Origin trial token management
- **styles.css**: UI styling

**Features**:
- Real-time AI availability checking
- Session management
- Workflow testing interface
- Activity logging
- Connection status monitoring

**Chrome AI Integration**:
```javascript
// Example: Prompt AI usage
const session = await window.ai.languageModel.create({
  temperature: 0.8,
  topK: 3,
  outputLanguage: 'en'
});
const result = await session.prompt("Hello, how are you?");
```

### 4. **Chrome Workflows Extension** (Optional)
**Location**: `chrome-workflows/`

**Purpose**: Right-click context menu to trigger n8n workflows

**Components**:
- **background.js**: Service worker for workflow management
- **manifest.json**: Extension configuration
- **popup/**: Extension popup interface
- **manage_workflows/**: Workflow management UI

**Features**:
- Right-click context menu integration
- Workflow triggering with page data
- Parameter collection
- Notification system

## 🔄 Data Flow Examples

### Example 1: Prompt AI Request

```
1. User creates n8n workflow with "Chrome Prompt AI" node
2. User executes workflow

n8n:
  execute() calls ChromeAiClient.promptAi({prompt: "Hello"})
    ↓
  axios.post('http://localhost:3333/api/prompt-ai', {userPrompt: "Hello"})

Bridge Server:
  POST /api/prompt-ai received
    ↓
  ws.send({id: 123, action: 'promptAI', params: {userPrompt: "Hello"}})
    ↓
  Wait for response...

Chrome Web App:
  Receives WebSocket message
    ↓
  const session = await window.ai.languageModel.create()
  const result = await session.prompt("Hello")
    ↓
  ws.send({id: 123, success: true, value: "Hello! How can I..."})

Bridge Server:
  Receives WebSocket response
    ↓
  Resolves pending promise
    ↓
  res.json({success: true, result: "Hello! How can I..."})

n8n:
  Receives HTTP response
    ↓
  Formats as node output
    ↓
  Passes to next node in workflow
```

### Example 2: Chrome Workflows Extension

```
1. User right-clicks on webpage
2. Selects "Trigger n8n Workflow" → "My Workflow"

Extension (background.js):
  chrome.contextMenus.onClicked receives click
    ↓
  chrome.scripting.executeScript to collect parameters
    ↓
  fetch('http://localhost:5678/webhook/my-workflow', {
    method: 'POST',
    body: JSON.stringify({
      url: tab.url,
      pageTitle: tab.title,
      selectionText: selectedText,
      parameters: collectedParams
    })
  })

n8n:
  Receives webhook
    ↓
  Executes workflow with Chrome AI nodes
    ↓
  Processes with Chrome AI
    ↓
  Returns result to extension
```

## 🛡️ Security Model

### Network Isolation
- All communication on localhost
- No external network access
- Firewall-friendly (no inbound connections)

### Authentication
- Optional API key in bridge server
- Validated on each request
- Stored securely in n8n credentials

### Data Privacy
- AI model runs on-device (Gemini Nano)
- No telemetry or logging to external services
- Data never transmitted externally

## 🚀 Setup Process

### 1. Enable Chrome AI
```bash
# 1. Join Chrome AI Early Preview Program
# https://goo.gle/chrome-ai-dev-preview-join

# 2. Enable Chrome flags
chrome://flags
- "Prompt API for Gemini Nano" → Enabled
- "Optimization Guide On Device" → Enabled

# 3. Download AI model
chrome://components/
- "Optimization Guide On Device Model" → Check for update
- Wait 5-10 minutes for ~1.5GB download
```

### 2. Start Services
```bash
# Terminal 1: Start n8n
n8n start

# Terminal 2: Start bridge server
cd webapp
npm install
npm start

# Terminal 3: Start Chrome workflows extension (optional)
cd chrome-workflows
# Load extension in chrome://extensions/
```

### 3. Open Web App
```
Chrome → http://localhost:3333
Keep this tab open (minimize is fine)
```

### 4. Configure n8n
```
n8n → Settings → Credentials → Chrome AI API
Bridge URL: http://localhost:3333
Save and test
```

## 📊 Performance Characteristics

### Latency
| Component | Typical Time |
|-----------|-------------|
| n8n → Bridge | < 1ms (localhost HTTP) |
| Bridge → WebSocket | < 1ms (localhost WS) |
| WebSocket → AI | 100-3000ms (depends on prompt) |
| **Total** | ~100-3000ms |

### Resource Usage
- Bridge server: ~50MB RAM
- Chrome webapp: ~20MB RAM
- AI model: ~2GB disk, ~500MB RAM during inference
- n8n: Standard n8n resource usage

### Throughput
- Sequential processing (one request at a time)
- ~1-10 requests per minute
- Limited by AI model inference speed

## 🔧 Configuration Files

### Environment Variables
**webapp/.env** (if needed):
```bash
N8N_API_KEY=your_n8n_api_key
BRIDGE_API_KEY=your_bridge_api_key
```

### Origin Trial Tokens
**webapp/public/tokens.js**:
```javascript
window.CHROME_AI_TOKENS = {
  'AIPromptAPIMultimodalInput': 'your_token_here',
  'WriterAPI': 'your_token_here',
  // ... other API tokens
};
```

### n8n Credentials
**n8n Settings → Credentials → Chrome AI API**:
```json
{
  "bridgeUrl": "http://localhost:3333",
  "apiKey": "optional_bridge_api_key"
}
```

## 🐛 Troubleshooting Flow

### Common Issues

1. **"Chrome AI bridge is not responding"**
   - Check if webapp server is running on port 3333
   - Verify WebSocket connection on port 3334
   - Ensure Chrome tab is open at localhost:3333

2. **"AI model not available"**
   - Enable Chrome AI flags in chrome://flags
   - Download AI model from chrome://components/
   - Restart Chrome after changes

3. **"Origin trial token expired"**
   - Check token expiration in tokens.js
   - Regenerate tokens from Chrome developer dashboard
   - Update tokens for correct origin (localhost vs chrome.dev)

4. **"WebSocket connection failed"**
   - Check firewall settings
   - Verify ports 3333 and 3334 are not blocked
   - Ensure Chrome allows localhost WebSocket connections

### Debug Tools

1. **Browser Console** (F12 in Chrome):
   - Check for WebSocket connection messages
   - Look for AI API availability status
   - Monitor token injection logs

2. **Network Tab** (F12 → Network):
   - Monitor HTTP requests to localhost:3333
   - Check WebSocket connections to localhost:3334
   - Verify request/response payloads

3. **Terminal Logs**:
   ```bash
   # Bridge server logs
   tail -f webapp/logs/server.log

   # n8n logs
   tail -f ~/.n8n/logs/n8n.log
   ```

## 🚀 Advanced Usage

### Custom Workflows
```javascript
// Example: Content processing pipeline
HTTP Request (article) → Language Detector → IF
  → (EN) Prompt AI (summarize) → Output
  → (Other) Translator → Prompt AI (summarize) → Output
```

### API Customization
```javascript
// Custom system prompts for consistent behavior
System Prompt: "You are a professional copywriter specializing in marketing content."
User Prompt: "Write a product description for: {{productName}}"
```

### Batch Processing
```javascript
// Process multiple items
Input Data (array) → Split into Items → Prompt AI → Merge → Output
```

## 🔮 Future Enhancements

### Multi-Chrome Support
- Multiple Chrome instances for load balancing
- Distributed processing across machines
- Queue management for high-volume workflows

### Enhanced AI Features
- Custom model selection
- Advanced parameters (topK, topP, etc.)
- Context window management
- Session persistence across workflows

### Enterprise Features
- User management and authentication
- Workflow templates and sharing
- Analytics and monitoring dashboard
- API rate limiting and quotas

## 📚 Related Documentation

- **Setup Guide**: `docs/SETUP.md`
- **API Reference**: `docs/NODE-REFERENCE.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **API Issues**: `webapp/CHROME-AI-APIS-ISSUES.md`

## 🎯 Key Benefits

1. **100% Local**: No data leaves your machine
2. **Zero Cost**: No API keys or usage fees
3. **Privacy First**: Complete data control
4. **Easy Integration**: Works with existing n8n workflows
5. **Professional UI**: Clean web interface for monitoring

## 🏁 Summary

This system provides a complete bridge between n8n automation workflows and Chrome's built-in AI capabilities. While only the Prompt AI API is currently functional, the architecture supports all 7 Chrome AI APIs and provides a solid foundation for future enhancements.

The system is designed for privacy, reliability, and ease of use, making on-device AI accessible through familiar n8n workflows.
