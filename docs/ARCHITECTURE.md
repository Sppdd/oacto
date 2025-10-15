# Architecture Documentation

Technical deep-dive into the Chrome AI × n8n integration.

## System Overview

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
│                                │  Extension       │     │
│                                │  (Service Worker)│     │
│                                └────────┬─────────┘     │
│                                         │               │
│                                Messages │               │
│                                         ▼               │
│                                ┌──────────────────┐     │
│                                │  Content Script  │     │
│                                │  (window.ai)     │     │
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

## Components

### 1. n8n Nodes (TypeScript)

**Location**: `packages/n8n-nodes-chrome-ai/`

**Responsibilities**:
- Expose Chrome AI as n8n nodes
- Validate input parameters
- Handle errors gracefully
- Format output data

**Key Files**:
- `credentials/ChromeAiApi.credentials.ts` - Bridge authentication
- `utils/ChromeAiClient.ts` - HTTP client for bridge communication
- `nodes/Chrome*.node.ts` - Individual node implementations

**Data Flow**:
```
n8n execution → Node execute() method
              → ChromeAiClient.promptAi()
              → axios.post('http://localhost:3333/api/prompt-ai')
              → Return formatted data
```

### 2. Bridge Server (Node.js)

**Location**: `packages/chrome-extension/server/`

**Responsibilities**:
- Accept HTTP requests from n8n
- Forward to Chrome extension via WebSocket
- Manage request/response correlation
- Handle timeouts and errors

**Technology**:
- Express.js (HTTP server on port 3333)
- ws library (WebSocket server on port 3334)

**Request Flow**:
```
1. n8n sends POST to /api/prompt-ai
2. Server validates request
3. Generates unique request ID
4. Sends to extension via WebSocket
5. Waits for response (30s timeout)
6. Returns response to n8n
```

**Endpoints**:
- `GET /api/health` - Health check
- `POST /api/prompt-ai` - Prompt API
- `POST /api/writer` - Writer API
- `POST /api/summarizer` - Summarizer API
- `POST /api/translator` - Translator API
- `POST /api/rewriter` - Rewriter API
- `POST /api/proofreader` - Proofreader API
- `POST /api/language-detector` - Language Detector API

### 3. Chrome Extension

**Location**: `packages/chrome-extension/`

**Manifest V3** components:

#### Service Worker (`background/service-worker.js`)

**Responsibilities**:
- Maintain WebSocket connection to bridge
- Auto-reconnect on disconnect
- Forward requests to content script
- Manage connection status

**Lifecycle**:
```
Extension loads → connectToBridge()
                → WebSocket opens
                → Listen for messages
                → Forward to content script
                → Send responses back
```

#### Content Script (`content/content-script.js`)

**Responsibilities**:
- Execute AI API calls in page context
- Access window.ai object
- Handle all 7 AI APIs
- Return results to service worker

**Why content script?**
- `window.ai` only accessible in page context
- Service workers don't have access
- Content scripts injected into every page

**Execution**:
```javascript
// Service worker sends message
chrome.tabs.sendMessage(tabId, { action: 'promptAI', params });

// Content script receives
chrome.runtime.onMessage.addListener(async (message) => {
  const result = await window.ai.languageModel.create();
  // ... execute AI
  sendResponse({ success: true, value: result });
});
```

#### Popup (`popup/`)

**Responsibilities**:
- Show connection status
- Display quick info
- Link to documentation

**Status Checks**:
- Bridge connection (via service worker)
- AI availability (via active tab check)

## Data Flow Example

### Prompt AI Request

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

Chrome Extension (Service Worker):
  ws.onmessage receives {id: 123, action: 'promptAI', ...}
    ↓
  chrome.tabs.sendMessage(activeTab, message)

Chrome Extension (Content Script):
  Receives message
    ↓
  const session = await window.ai.languageModel.create()
  const result = await session.prompt("Hello")
    ↓
  sendResponse({success: true, value: result})

Service Worker:
  Receives response
    ↓
  ws.send({id: 123, success: true, value: "Hello! How can I..."})

Bridge Server:
  ws.onmessage receives response
    ↓
  Resolves pending promise
    ↓
  res.json({success: true, result: "Hello! How can I..."})

n8n:
  Receives response
    ↓
  Formats as node output
    ↓
  Passes to next node
```

## Security Model

### Network Isolation

- All communication on localhost
- No external network access
- Firewall-friendly (no inbound connections)

### Authentication

- Optional API key in bridge
- Validated on each request
- Stored securely in n8n credentials

### Data Privacy

- AI model runs on-device
- No telemetry or logging
- Data never transmitted externally

## Performance Characteristics

### Latency

| Component | Latency |
|-----------|---------|
| n8n → Bridge | < 1ms (localhost HTTP) |
| Bridge → Extension | < 1ms (localhost WebSocket) |
| Extension → AI | 100-3000ms (depends on prompt) |
| **Total** | ~100-3000ms |

### Throughput

- Sequential processing (one request at a time)
- ~1-10 requests per minute
- Limited by AI model inference speed

### Resource Usage

- Bridge server: ~50MB RAM
- Chrome extension: ~20MB RAM
- AI model: ~2GB disk, ~500MB RAM during inference

## Scalability

### Current Limitations

- Single Chrome instance
- One AI request at a time
- No distributed execution

### Future Enhancements

- Multiple Chrome instances
- Request queuing
- Load balancing
- Distributed processing

## Error Handling

### Timeout Strategy

```
n8n node timeout: 30s
  ↓
Bridge timeout: 30s
  ↓
WebSocket timeout: 30s
  ↓
AI execution: Variable (1-10s)
```

### Retry Logic

- n8n: Configurable retries
- Bridge: No automatic retry
- Extension: Auto-reconnect on disconnect

### Error Propagation

```
AI Error → Content Script → Service Worker
         → Bridge Server → n8n Node
         → User sees error in workflow
```

## Extensibility

### Adding New AI APIs

When Chrome adds new APIs:

1. Add method to `ChromeAiClient.ts`
2. Add endpoint to bridge `server.js`
3. Add handler to `content-script.js`
4. Create new n8n node
5. Update package.json
6. Rebuild and publish

### Custom Nodes

Developers can create nodes using ChromeAiClient:

```typescript
import { ChromeAiClient } from 'n8n-nodes-chrome-ai';

// Your custom node
const client = new ChromeAiClient({bridgeUrl: '...'});
const result = await client.promptAi({...});
```

## Deployment

### Local Development

```
Developer machine:
- All components run locally
- Hot reload enabled
- Debug logs active
```

### Production (Single User)

```
User machine:
- Bridge server as background service
- Extension auto-starts
- n8n runs 24/7
```

### Team Deployment

```
Shared server:
- n8n on server
- Bridge + Extension on each user's machine
- Central workflow management
```

## Monitoring

### Bridge Server Logs

```
✅ Chrome Extension connected
📨 Received request: promptAI
Response time: 1.2s
```

### Extension Console

```javascript
// Service worker
chrome://extensions/ → service worker

// Content script
F12 on any page → Console
```

### n8n Logs

```
Execution logs in n8n UI
Error tracking in workflow executions
```

## Testing Strategy

### Unit Tests

- Each n8n node tested independently
- Mock ChromeAiClient
- Test parameter validation

### Integration Tests

- Bridge server endpoints
- WebSocket communication
- End-to-end request flow

### E2E Tests

- Real workflow execution
- All AI APIs tested
- Performance benchmarks

---

## Technical Decisions

### Why WebSocket for Extension?

- Chrome extensions can't run HTTP servers
- WebSocket allows bidirectional communication
- Auto-reconnect on disconnect

### Why Separate Bridge Server?

- n8n nodes can't directly connect to extensions
- HTTP REST API familiar to n8n
- Decouples n8n from Chrome specifics

### Why Content Scripts?

- `window.ai` only in page context
- Service workers don't have access
- Content scripts bridge the gap

### Why TypeScript for Nodes?

- Type safety
- Better IDE support
- n8n best practices
- Easier maintenance

---

**Questions?** See `docs/SETUP.md` or `docs/NODE-REFERENCE.md`

